# Webhook Configuration Guide

## Endpoint URL

Use the following endpoint URL in your Whop dashboard:

### Production
```
https://your-domain.com/api/webhooks
```

### Local Development (with ngrok)
```
https://your-ngrok-url.ngrok.io/api/webhooks
```

**Replace `your-domain.com` with your actual production domain.**

---

## Events to Select

Select the following events in your Whop dashboard:

### ✅ Required Events (Select These)

1. **`payment_succeeded`** ⭐ Highly Recommended
   - Grants access when a payment succeeds
   - Primary event for granting access to paid tier lists

2. **`invoice_paid`** ⭐ Highly Recommended
   - More reliable than `payment_succeeded` in some cases
   - Also grants access when invoice is paid
   - Good backup for `payment_succeeded`

3. **`membership_activated`**
   - Grants access when membership is activated
   - Useful if you use Whop memberships for tier list access

4. **`membership_deactivated`**
   - Handles membership cancellation
   - Logs deactivation (access is retained by default)

### ⚠️ Optional Events (Select If Needed)

5. **`invoice_voided`**
   - Handles voided invoices
   - Currently logs but doesn't revoke access (can be enabled if needed)

6. **`invoice_created`**
   - Logs invoice creation (not currently handled)
   - Useful for tracking

7. **`invoice_past_due`**
   - Logs past due invoices (not currently handled)
   - Useful for notifications

8. **`payment_failed`** or **`payment_pending`**
   - Logs payment failures/pending (not currently handled)
   - Useful for tracking failed payments

### ❌ Events Not Needed (Don't Select)

- `entry_created`, `entry_approved`, `entry_denied`, `entry_deleted`
- `course_lesson_interaction_completed`

These events are for Whop's built-in entry/course features, not for custom apps.

---

## Recommended Configuration

**Minimum Recommended Selection:**
- ✅ `payment_succeeded`
- ✅ `invoice_paid`
- ✅ `membership_activated`
- ✅ `membership_deactivated`

**For Full Coverage:**
- ✅ `payment_succeeded`
- ✅ `invoice_paid`
- ✅ `invoice_voided`
- ✅ `invoice_created` (optional, for tracking)
- ✅ `invoice_past_due` (optional, for notifications)
- ✅ `membership_activated`
- ✅ `membership_deactivated`
- ✅ `payment_failed` (optional, for tracking)
- ✅ `payment_pending` (optional, for tracking)

---

## Setup Steps

1. **Get Your Endpoint URL**
   - Production: `https://your-domain.com/api/webhooks`
   - Local: Use ngrok to get a public URL

2. **Go to Whop Dashboard**
   - Navigate to your App → Settings → Webhooks

3. **Add Webhook Endpoint**
   - Click "Add Webhook" or "New Webhook"
   - Enter your endpoint URL: `https://your-domain.com/api/webhooks`

4. **Select Events**
   - Select the events listed above (at minimum: `payment_succeeded`, `invoice_paid`, `membership_activated`, `membership_deactivated`)

5. **Copy Webhook Secret**
   - Copy the webhook secret provided by Whop
   - Add it to your `.env.development.local` file:
     ```
     WHOP_WEBHOOK_SECRET=your_webhook_secret_here
     ```

6. **Save and Test**
   - Save the webhook configuration
   - Test by making a payment or activating a membership
   - Check your server logs for webhook events

---

## How Events Work

### `payment_succeeded`
- **When**: User successfully completes a payment
- **Action**: Grants access to the tier list (if `templateId` is in metadata)
- **Handler**: `handlePaymentSucceeded()`

### `invoice_paid`
- **When**: An invoice is marked as paid
- **Action**: Grants access to the tier list (if `templateId` is in metadata)
- **Handler**: `handleInvoicePaid()`
- **Note**: More reliable than `payment_succeeded` in some payment flows

### `invoice_voided`
- **When**: An invoice is voided/cancelled
- **Action**: Logs the event (access is retained by default)
- **Handler**: `handleInvoiceVoided()`
- **Note**: Uncomment code in handler if you want to revoke access

### `membership_activated`
- **When**: A membership is activated
- **Action**: Grants access (if `templateId` is in metadata)
- **Handler**: `handleMembershipActivated()`

### `membership_deactivated`
- **When**: A membership is deactivated/cancelled
- **Action**: Logs the event (access is retained by default)
- **Handler**: `handleMembershipDeactivated()`

---

## Metadata Requirements

For payment and invoice events to grant access, you need to include `templateId` in the metadata when creating payments.

When creating a payment checkout, include metadata:
```typescript
const checkout = await whopsdk.checkouts.create({
  productId: productId,
  amount: amount,
  userId: userId,
  metadata: {
    templateId: tierListId, // Required for webhook to grant access
  },
});
```

---

## Testing

### Local Testing
1. Start ngrok: `ngrok http 3000`
2. Use ngrok URL in Whop dashboard
3. Make a test payment
4. Check server logs for webhook events

### Production Testing
1. Deploy your app
2. Configure webhook URL in Whop dashboard
3. Make a test payment
4. Verify access is granted in database

---

## Troubleshooting

### Webhook Not Receiving Events
- Verify endpoint URL is correct
- Check `WHOP_WEBHOOK_SECRET` is set correctly
- Ensure webhook is enabled in Whop dashboard
- Check server logs for errors

### Access Not Granted
- Verify `templateId` is in payment metadata
- Check Supabase logs for database errors
- Verify `user_paid_access` table exists
- Check webhook handler logs

### Webhook Validation Failing
- Verify `WHOP_WEBHOOK_SECRET` matches Whop dashboard
- Check webhook signature validation
- Ensure headers are passed correctly

---

## Summary

**Endpoint URL:**
```
https://your-domain.com/api/webhooks
```

**Minimum Events to Select:**
- `payment_succeeded`
- `invoice_paid`
- `membership_activated`
- `membership_deactivated`

Your webhook handler is ready to process these events! 🎉

