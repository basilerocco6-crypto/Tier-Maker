# In-App Purchase Setup Guide

This guide explains how in-app purchases are implemented for the Whop Tier List App.

## Overview

The in-app purchase flow allows users to purchase access to paid tier lists directly within the Whop iframe using Whop's native in-app purchase modal.

## Architecture

### 1. Server Action/API Route (`app/api/checkout/create/route.ts`)

Creates a checkout configuration using `whopsdk.checkoutConfigurations.create()`:

```typescript
const checkoutConfig = await whopsdk.checkoutConfigurations.create({
  company_id: companyId,
  initial_price: price, // in cents
  plan_type: "one_time", // or "recurring"
  metadata: {
    templateId: templateId,
    userId: userId,
    item_id: templateId,
    variant: "tier_list_access",
  },
});
```

**Requirements:**
- `NEXT_PUBLIC_WHOP_COMPANY_ID` must be set in environment variables
- User must be authenticated (verified via `whopsdk.verifyUserToken`)
- `templateId` and `price` must be provided in request body

**Returns:**
- `checkoutConfig.id` - Used as `planId` for in-app purchase
- Checkout configuration metadata

### 2. Client Component (`components/PurchaseButton.tsx`)

Handles the purchase flow:

1. **Creates checkout configuration** via API call
2. **Opens in-app purchase modal** using `iframeSdk.inAppPurchase()`
3. **Handles response** - checks `res.status === "ok"`
4. **Stores receipt_id** for verification
5. **Triggers webhook** for access granting

**Usage:**
```tsx
<PurchaseButton
  templateId={templateId}
  price={priceInCents}
  onPurchaseSuccess={() => {}}
  onPurchaseError={(error) => {}}
  variant="classic"
  size="4"
/>
```

### 3. Webhook Verification (`app/api/webhooks/route.ts`)

Webhooks automatically grant access when payment succeeds:

- **`payment_succeeded`** event → Grants access via `handlePaymentSucceeded()`
- **`invoice_paid`** event → Grants access via `handleInvoicePaid()`

Both handlers:
1. Extract `templateId` from metadata
2. Create `user_paid_access` record in Supabase
3. Grant user access to the tier list

## Flow Diagram

```
User clicks "Pay to Unlock"
    ↓
PurchaseButton component
    ↓
1. Call /api/checkout/create
    ↓
2. Create checkout configuration
    ↓
3. Call iframeSdk.inAppPurchase({ planId, id })
    ↓
4. Whop shows in-app purchase modal
    ↓
5. User completes payment
    ↓
6. Webhook receives payment_succeeded event
    ↓
7. Webhook grants access (creates user_paid_access record)
    ↓
8. User gets access to tier list
```

## Error Handling

### PurchaseButton Component

- **Loading state**: Shows "Processing..." while creating checkout
- **Error display**: Shows error message if purchase fails
- **Retry functionality**: User can click button again to retry
- **Validation**: Checks if `iframeSdk.inAppPurchase` is available

### Error Cases Handled

1. **Checkout creation fails**
   - Shows error: "Failed to create checkout"
   - User can retry

2. **In-app purchase not available**
   - Shows warning: "In-app purchase not available. Please ensure you're in the Whop iframe."
   - Button is disabled

3. **Purchase cancelled**
   - No error shown (user cancelled intentionally)
   - User can retry

4. **Purchase failed**
   - Shows error message from Whop
   - User can retry

5. **Network errors**
   - Shows generic error: "Failed to process purchase. Please try again."
   - User can retry

### Logging

All errors are logged to console:
- `[PURCHASE ERROR]` - Purchase failures
- `[PURCHASE SUCCESS]` - Successful purchases
- `[PURCHASE CANCELLED]` - User cancellations
- `[CHECKOUT CREATE ERROR]` - Checkout creation failures

## Receipt Storage

On successful purchase, `receipt_id` is stored in `localStorage`:

```javascript
localStorage.setItem(
  `purchase_${templateId}`,
  JSON.stringify({
    receiptId: receiptId,
    timestamp: new Date().toISOString(),
  })
);
```

This can be used for:
- Receipt verification
- Purchase history
- Debugging

## Metadata Structure

When creating checkout configuration, include:

```typescript
metadata: {
  templateId: templateId,      // Tier list ID (required)
  template_id: templateId,     // Alternative key
  userId: userId,              // User ID (required)
  user_id: userId,             // Alternative key
  item_id: templateId,         // Item identifier
  variant: "tier_list_access", // Product variant
}
```

The webhook handler extracts `templateId` from metadata to grant access.

## Testing

### Local Testing

1. **Start development server**: `pnpm dev`
2. **Ensure you're in Whop iframe**: Access via Whop dev proxy
3. **Navigate to paid tier list**: Should show "Pay to Unlock" button
4. **Click purchase button**: Should open in-app purchase modal
5. **Complete test payment**: Use test payment method
6. **Verify webhook**: Check server logs for `[PAYMENT SUCCEEDED]`
7. **Verify access**: Refresh page, should have access

### Production Testing

1. **Deploy app**: Ensure all environment variables are set
2. **Configure webhook**: Set webhook URL in Whop dashboard
3. **Test purchase flow**: Make real payment (small amount)
4. **Verify access**: Confirm user gets access after payment
5. **Check logs**: Verify webhook events are received

## Environment Variables

Required environment variables:

```bash
# Whop Configuration
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
WHOP_API_KEY=your_api_key
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id  # Required for checkout
WHOP_WEBHOOK_SECRET=your_webhook_secret
```

## Integration Points

### MemberListPage Component

The `MemberListPage` component uses `PurchaseButton` for paid tier lists:

```tsx
// State B: Paid, Published List (Gated)
if (template.accessType === "paid" && !hasAccess) {
  return (
    <PaidGatedView template={template} userId={userId} />
  );
}
```

The `PaidGatedView` component:
- Shows "Pay to Unlock" message
- Displays purchase button
- Handles success/error states
- Reloads page after successful purchase

### Webhook Integration

Webhooks automatically grant access:
- `payment_succeeded` → `handlePaymentSucceeded()`
- `invoice_paid` → `handleInvoicePaid()`

Both handlers create `user_paid_access` records in Supabase.

## Troubleshooting

### Purchase Button Not Working

1. **Check iframe**: Ensure app is accessed via Whop iframe
2. **Check environment**: Verify `NEXT_PUBLIC_WHOP_COMPANY_ID` is set
3. **Check authentication**: Verify user token is valid
4. **Check logs**: Look for `[CHECKOUT CREATE ERROR]` in console

### Access Not Granted After Purchase

1. **Check webhook**: Verify webhook URL is configured correctly
2. **Check metadata**: Verify `templateId` is in checkout metadata
3. **Check database**: Verify `user_paid_access` table exists
4. **Check logs**: Look for `[PAYMENT SUCCEEDED]` or `[INVOICE PAID]` in logs
5. **Check Supabase**: Verify record was created in database

### In-App Purchase Modal Not Opening

1. **Check iframe**: Ensure app is in Whop iframe (not localhost direct)
2. **Check SDK**: Verify `iframeSdk.inAppPurchase` is available
3. **Check network**: Verify API call to `/api/checkout/create` succeeds
4. **Check console**: Look for errors in browser console

### Payment Succeeds But Access Not Granted

1. **Check webhook logs**: Verify webhook received event
2. **Check metadata**: Verify `templateId` is in webhook metadata
3. **Check database**: Verify record creation succeeded
4. **Manual grant**: Can manually create `user_paid_access` record if needed

## Best Practices

1. **Always handle errors**: Show user-friendly error messages
2. **Provide feedback**: Show loading states during purchase
3. **Allow retries**: Enable users to retry failed purchases
4. **Log everything**: Log all purchase events for debugging
5. **Verify webhooks**: Always verify webhook events grant access
6. **Test thoroughly**: Test purchase flow in both dev and production

## Summary

✅ **API Route**: `app/api/checkout/create/route.ts` - Creates checkout configuration
✅ **Purchase Button**: `components/PurchaseButton.tsx` - Handles purchase flow
✅ **Webhook Integration**: Already set up in `app/api/webhooks/route.ts`
✅ **Error Handling**: Comprehensive error handling and retry functionality
✅ **Receipt Storage**: Stores `receipt_id` in localStorage
✅ **User Feedback**: Shows loading, success, and error states

Your in-app purchase system is ready! 🎉

