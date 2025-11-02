# Webhook Setup Guide

This guide explains how webhooks are configured for the Whop Tier List App.

## Overview

The webhook handler at `app/api/webhooks/route.ts` receives events from Whop when certain actions occur:
- **Payment succeeded**: When a user completes a payment for a tier list
- **Membership activated**: When a membership is activated
- **Membership deactivated**: When a membership is deactivated

## Environment Variables

**Required:**
- `WHOP_WEBHOOK_SECRET`: Your Whop webhook secret key (set in Whop dashboard)

This secret is used to validate that webhooks are actually coming from Whop.

## Webhook Configuration in Whop

1. Go to your Whop App dashboard
2. Navigate to Settings → Webhooks
3. Add a webhook endpoint: `https://your-domain.com/api/webhooks`
4. Select the events you want to receive:
   - `payment.succeeded`
   - `membership.activated`
   - `membership.deactivated`
5. Copy the webhook secret and add it to your `.env.development.local` file

## How It Works

### 1. Webhook Validation

When Whop sends a webhook:
1. The request body is read as text
2. Headers are converted to an object
3. `whopsdk.webhooks.unwrap()` validates the webhook signature using `WHOP_WEBHOOK_SECRET`
4. If valid, the webhook data is parsed

### 2. Event Handling

Different event types are handled in separate functions:
- `handlePaymentSucceeded()` - Grants access to paid tier lists
- `handleMembershipActivated()` - Activates membership access
- `handleMembershipDeactivated()` - Handles membership cancellation

### 3. Async Processing

All webhook handlers use `waitUntil()` from `@vercel/functions`:
- Processes events asynchronously without blocking the response
- Allows the handler to return 200 immediately
- Prevents webhook retries due to timeouts

### 4. Database Updates

Webhooks update the `user_paid_access` table:
- When a payment succeeds, access is granted by inserting/updating a record
- Uses `upsert` to prevent duplicates
- Links `user_id` (Whop user ID) to `template_id` (tier list ID)

## Event Handlers

### payment.succeeded

**What it does:**
- Grants access to a paid tier list
- Creates/updates `user_paid_access` record

**Metadata expected:**
```json
{
  "templateId": "uuid-of-tier-list",
  "template_id": "uuid-of-tier-list"
}
```

**Database update:**
```sql
INSERT INTO user_paid_access (user_id, template_id)
VALUES (payment.user_id, metadata.templateId)
ON CONFLICT (user_id, template_id) DO NOTHING
```

### membership.activated

**What it does:**
- Activates membership access for a user
- Optionally grants access to tier lists based on membership level

**Metadata expected:**
```json
{
  "templateId": "uuid-of-tier-list" // optional
}
```

### membership.deactivated

**What it does:**
- Handles membership cancellation
- Currently preserves access (for historical records)
- Can be modified to revoke access if needed

**Note:** By default, access is retained even after deactivation. Uncomment the deletion code if you want to revoke access immediately.

## Metadata Structure

When creating payments (in `app/api/payments/create/route.ts`), pass metadata:

```typescript
const checkout = await whopsdk.checkouts.create({
  productId: productId,
  amount: amount,
  userId: userId,
  metadata: {
    templateId: tierListId, // This will be included in webhook
    // Add other metadata as needed
  },
});
```

This metadata will be available in the webhook handler via `webhookData.data.metadata`.

## Error Handling

- Webhooks always return 200 status to prevent retries
- Errors are logged to console for debugging
- Database errors don't crash the handler
- Failed processing can be retried manually if needed

## Logging

All webhook events are logged:
- `[WEBHOOK]` - General webhook events
- `[PAYMENT SUCCEEDED]` - Payment success
- `[MEMBERSHIP ACTIVATED]` - Membership activation
- `[MEMBERSHIP DEACTIVATED]` - Membership deactivation
- `[WEBHOOK ERROR]` - Error logs

Check your server logs or Vercel function logs to debug webhook issues.

## Testing

### Local Testing

1. Use a tool like [ngrok](https://ngrok.com/) to expose your local server:
   ```bash
   ngrok http 3000
   ```

2. Set the webhook URL in Whop dashboard to your ngrok URL:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks
   ```

3. Test webhooks by triggering events in your Whop app

### Production Testing

1. Deploy your app to production
2. Set the webhook URL in Whop dashboard:
   ```
   https://your-domain.com/api/webhooks
   ```
3. Test with actual payments or membership changes
4. Monitor logs for successful processing

## Troubleshooting

### Webhook not receiving events

1. Check `WHOP_WEBHOOK_SECRET` is set correctly
2. Verify webhook URL is correct in Whop dashboard
3. Check server logs for errors
4. Ensure webhook endpoint is publicly accessible

### Access not granted after payment

1. Check payment metadata includes `templateId`
2. Verify `user_paid_access` table exists
3. Check Supabase logs for database errors
4. Ensure `user_id` and `template_id` are valid

### Webhook validation failing

1. Verify `WHOP_WEBHOOK_SECRET` matches Whop dashboard
2. Check webhook signature validation is working
3. Ensure headers are passed correctly

## Security Notes

- Always validate webhooks using `whopsdk.webhooks.unwrap()`
- Never expose `WHOP_WEBHOOK_SECRET` in client-side code
- Keep webhook handlers idempotent (safe to retry)
- Log events for auditing

## Next Steps

After setting up webhooks:

1. Test payment flow end-to-end
2. Verify access is granted correctly
3. Monitor webhook success/failure rates
4. Set up alerts for webhook failures
5. Add additional event handlers as needed

## Example Usage

When a user purchases access to a tier list:

1. Frontend calls `/api/payments/create` with `templateId` in metadata
2. User completes payment through Whop checkout
3. Whop sends `payment.succeeded` webhook
4. Webhook handler extracts `templateId` from metadata
5. Handler creates `user_paid_access` record
6. User now has access to the tier list

## Summary

✅ **Webhook Handler**: `app/api/webhooks/route.ts`
✅ **Event Types**: `payment.succeeded`, `membership.activated`, `membership.deactivated`
✅ **Async Processing**: Uses `waitUntil()` from `@vercel/functions`
✅ **Database Updates**: Updates `user_paid_access` table
✅ **Error Handling**: Logs errors, always returns 200
✅ **Metadata Support**: Accesses `templateId` from webhook metadata
✅ **Security**: Validates webhooks with `WHOP_WEBHOOK_SECRET`

Your webhook system is ready to handle Whop events! 🎉

