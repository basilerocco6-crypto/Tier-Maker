# Vercel Environment Variables Setup

## ⚠️ CRITICAL: Set These Before Deployment

Your Vercel build is failing because environment variables are missing. You **MUST** set these in Vercel before the build will succeed.

## Steps to Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: Click on `my_whop_app` or `Tier-Maker`
3. **Go to Settings**: Click "Settings" tab
4. **Environment Variables**: Click "Environment Variables" in the sidebar
5. **Add Each Variable**: Click "Add New" for each variable below

## Required Environment Variables

Add ALL of these (copy values from your `.env.development.local`):

```
WHOP_API_KEY
```
- **Value**: Your Whop API key
- **Environment**: Production, Preview, Development

```
NEXT_PUBLIC_WHOP_APP_ID
```
- **Value**: Your Whop App ID
- **Environment**: Production, Preview, Development

```
NEXT_PUBLIC_WHOP_AGENT_USER_ID
```
- **Value**: Your Whop Agent User ID
- **Environment**: Production, Preview, Development

```
NEXT_PUBLIC_WHOP_COMPANY_ID
```
- **Value**: Your Whop Company ID
- **Environment**: Production, Preview, Development

```
WHOP_WEBHOOK_SECRET
```
- **Value**: Your Whop Webhook Secret
- **Environment**: Production, Preview, Development

```
NEXT_PUBLIC_SUPABASE_URL
```
- **Value**: Your Supabase project URL
- **Environment**: Production, Preview, Development

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Value**: Your Supabase anonymous key
- **Environment**: Production, Preview, Development

```
SUPABASE_SERVICE_ROLE_KEY
```
- **Value**: Your Supabase service role key
- **Environment**: Production, Preview, Development

## After Adding Variables

1. **Redeploy**: Go to "Deployments" tab
2. **Click "..."** on the latest deployment
3. **Click "Redeploy"**
4. **Select "Use existing Build Cache"** (optional)
5. **Click "Redeploy"**

The build should now succeed! 🎉

