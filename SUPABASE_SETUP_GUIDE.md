# Supabase Database Setup Guide

This guide explains how to set up the Supabase database for your Whop app with users and purchases tables.

## Prerequisites

- Supabase project created
- Supabase SQL Editor access
- Environment variables configured

## Step 1: Run Database Schema

### 1.1 Run Tier List Schema (if not already done)

Run `lib/supabase-schema.sql` in Supabase SQL Editor to create tier list tables.

### 1.2 Run Users and Purchases Schema

Run `lib/supabase-users-schema.sql` in Supabase SQL Editor to create users and purchases tables.

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy contents of `lib/supabase-users-schema.sql`
4. Paste into SQL Editor
5. Click "Run" or press `Cmd/Ctrl + Enter`

**What this creates:**
- `users` table (stores Whop user data)
- `purchases` table (stores purchase history)
- Indexes for fast lookups
- RLS policies for security
- Triggers for `updated_at` timestamps

## Step 2: Verify Tables

1. Go to Supabase Dashboard → Table Editor
2. Verify these tables exist:
   - `users`
   - `purchases`
   - `tier_list_templates` (from previous schema)
   - `tier_list_submissions` (from previous schema)
   - `user_paid_access` (from previous schema)

## Step 3: Verify Helper Functions

The helper functions in `lib/supabase-helpers.ts` are ready to use:

- `getUserByWhopId(whopUserId)` - Get user by Whop ID
- `createOrUpdateUser(userData)` - Create or update user
- `createPurchase(purchaseData)` - Create purchase record
- `getUserPurchases(userId)` - Get user's purchase history
- `getUserPurchasesByWhopId(whopUserId)` - Get purchases by Whop ID

## Step 4: Integration Status

### ✅ Already Integrated

1. **Webhooks** (`app/api/webhooks/route.ts`):
   - `payment.succeeded` events create/update users and purchases
   - `invoice.paid` events create/update users and purchases

2. **Authentication** (`lib/auth-helper.ts`):
   - `ensureUser(whopUserId)` - Creates/updates user on authentication
   - `getUserIdAndEnsureUser()` - Convenience function that combines authentication and user creation

### 🔄 How It Works

1. **On Payment**:
   - Webhook receives `payment.succeeded` or `invoice.paid` event
   - Checks if user exists in Supabase (by `whop_user_id`)
   - If not, fetches user from Whop API and creates Supabase user
   - Creates purchase record in `purchases` table
   - Grants access via `user_paid_access` table

2. **On Authentication**:
   - User authenticates via Whop token
   - `ensureUser()` is called (non-blocking)
   - Checks if user exists in Supabase
   - If not, creates user record with Whop data

## Step 5: Usage Examples

### Get User by Whop ID

```typescript
import { getUserByWhopId } from "@/lib/supabase-helpers";

const user = await getUserByWhopId("whop_user_id_123");
if (user) {
  console.log("User found:", user.id);
} else {
  console.log("User not found");
}
```

### Create or Update User

```typescript
import { createOrUpdateUser } from "@/lib/supabase-helpers";

const user = await createOrUpdateUser({
  whop_user_id: "whop_user_id_123",
  whop_username: "johndoe",
  email: "john@example.com",
});
```

### Create Purchase

```typescript
import { createPurchase, getUserByWhopId } from "@/lib/supabase-helpers";

const user = await getUserByWhopId("whop_user_id_123");
if (user) {
  const purchase = await createPurchase({
    user_id: user.id, // UUID from users table
    whop_payment_id: "payment_123",
    amount: 999, // in cents
    status: "completed",
    metadata: { templateId: "template_123" },
  });
}
```

### Get User Purchases

```typescript
import { getUserPurchasesByWhopId } from "@/lib/supabase-helpers";

const purchases = await getUserPurchasesByWhopId("whop_user_id_123");
purchases.forEach((purchase) => {
  console.log(`Purchase: ${purchase.whop_payment_id}, Amount: $${purchase.amount / 100}`);
});
```

## Step 6: Verify Integration

### Test Webhook Handler

1. Make a test purchase in your Whop app
2. Check Vercel function logs for:
   - `[PAYMENT SUCCEEDED]` or `[INVOICE PAID]` logs
   - `Purchase record created` logs
   - `Access granted` logs

### Test User Creation

1. Authenticate in your app (access any protected route)
2. Check Supabase `users` table for new user record
3. Verify `whop_user_id` matches your Whop user ID

### Test Purchase Records

1. Make a purchase
2. Check Supabase `purchases` table for new purchase record
3. Verify `user_id` links to correct user in `users` table
4. Verify `whop_payment_id` matches Whop payment ID

## Database Schema Reference

### users Table

| Column         | Type     | Constraints           |
|----------------|----------|-----------------------|
| id             | uuid     | Primary Key           |
| whop_user_id   | text     | Unique, Not Null     |
| whop_username  | text     | Nullable              |
| email          | text     | Nullable              |
| created_at     | timestamptz | Default: NOW()    |
| updated_at     | timestamptz | Default: NOW()    |

### purchases Table

| Column           | Type     | Constraints                         |
|------------------|----------|-------------------------------------|
| id               | uuid     | Primary Key                         |
| user_id          | uuid     | Foreign Key → users.id              |
| whop_payment_id  | text     | Unique, Not Null                     |
| amount           | numeric  | Not Null                             |
| status           | text     | CHECK: pending/completed/failed/refunded |
| metadata         | jsonb    | Default: {}                          |
| created_at       | timestamptz | Default: NOW()                   |

## Row Level Security (RLS)

RLS is enabled on both tables. Policies allow:
- Service role (server-side) to bypass RLS
- Users to read their own data (when authenticated)

**Note:** Server-side operations use `supabaseAdmin` which bypasses RLS automatically.

## Indexes

Indexes created for performance:
- `idx_users_whop_user_id` - Fast user lookups
- `idx_purchases_whop_payment_id` - Fast payment lookups
- `idx_purchases_user_id` - Fast user purchase queries
- `idx_purchases_status` - Filter by status
- `idx_purchases_created_at` - Sort by date

## Troubleshooting

### Error: "relation 'users' does not exist"

**Solution:** Run `lib/supabase-users-schema.sql` in Supabase SQL Editor.

### Error: "duplicate key value violates unique constraint"

**Solution:** This is expected when upserting. The `createOrUpdateUser()` function handles this automatically.

### Error: "foreign key constraint violation"

**Solution:** Ensure user exists before creating purchase. Use `getUserByWhopId()` first, or create user via `createOrUpdateUser()`.

### Users not being created automatically

**Check:**
1. Webhook handler is receiving events
2. `WHOP_WEBHOOK_SECRET` is set correctly
3. Vercel function logs show webhook processing
4. Supabase connection is working (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`)

## Next Steps

- ✅ Database schema created
- ✅ Helper functions ready
- ✅ Webhook integration complete
- ✅ Authentication integration complete

Your Supabase database is now set up and integrated with your Whop app! 🎉

