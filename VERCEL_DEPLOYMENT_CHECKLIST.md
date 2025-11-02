# Vercel Deployment Checklist

Use this checklist to ensure a successful deployment to Vercel.

## Pre-Deployment

### Code Preparation
- [ ] Code is pushed to GitHub repository
- [ ] All commits are pushed to `main` branch
- [ ] No build errors locally (`pnpm build` succeeds)
- [ ] `.gitignore` includes `.env*.local` files
- [ ] No sensitive data in codebase

### Environment Variables Ready
- [ ] `WHOP_API_KEY` - from Whop Developer Dashboard
- [ ] `NEXT_PUBLIC_WHOP_APP_ID` - from Whop Developer Dashboard
- [ ] `NEXT_PUBLIC_WHOP_AGENT_USER_ID` - from Whop Developer Dashboard
- [ ] `NEXT_PUBLIC_WHOP_COMPANY_ID` - from Whop Developer Dashboard
- [ ] `WHOP_WEBHOOK_SECRET` - from Whop Developer Dashboard
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - from Supabase Dashboard
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Supabase Dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - from Supabase Dashboard

## Vercel Setup

### Step 1: Connect GitHub
- [ ] Signed in to Vercel account
- [ ] Clicked "Add New Project"
- [ ] Selected GitHub repository (`basilerocco6-crypto/Tier-Maker`)
- [ ] Clicked "Import"

### Step 2: Environment Variables
- [ ] Went to Project Settings → Environment Variables
- [ ] Added `WHOP_API_KEY` (Production, Preview, Development)
- [ ] Added `NEXT_PUBLIC_WHOP_APP_ID` (Production, Preview, Development)
- [ ] Added `NEXT_PUBLIC_WHOP_AGENT_USER_ID` (Production, Preview, Development)
- [ ] Added `NEXT_PUBLIC_WHOP_COMPANY_ID` (Production, Preview, Development)
- [ ] Added `WHOP_WEBHOOK_SECRET` (Production, Preview, Development)
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development)
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development)
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` (Production, Preview, Development)
- [ ] Verified all variable names are correct (case-sensitive)
- [ ] Verified all values are correct

### Step 3: Build Configuration
- [ ] Framework Preset is "Next.js" (auto-detected)
- [ ] Build Command is `pnpm build` (auto-detected)
- [ ] Install Command is `pnpm install` (auto-detected)

### Step 4: Deploy
- [ ] Clicked "Deploy"
- [ ] Build completed successfully
- [ ] No build errors in logs
- [ ] Production URL received: `https://your-app.vercel.app`
- [ ] Copied production URL

## Whop Configuration

### App Settings
- [ ] Logged into Whop Developer Dashboard
- [ ] Navigated to app settings
- [ ] Set "Base URL" to `https://your-app.vercel.app`
- [ ] Saved changes

### Webhook Settings
- [ ] Navigated to Webhooks section
- [ ] Updated webhook URL to: `https://your-app.vercel.app/api/webhooks`
- [ ] Verified `WHOP_WEBHOOK_SECRET` matches Vercel environment variable
- [ ] Saved changes

## Supabase Configuration

### URL Configuration
- [ ] Logged into Supabase Dashboard
- [ ] Went to Authentication → URL Configuration
- [ ] Set "Site URL" to `https://your-app.vercel.app`
- [ ] Added redirect URL: `https://your-app.vercel.app/**`
- [ ] Added redirect URL: `https://your-app.vercel.app/*`
- [ ] Saved changes

## Testing

### Basic Functionality
- [ ] Production URL loads: `https://your-app.vercel.app`
- [ ] No console errors in browser
- [ ] All pages are accessible
- [ ] Navigation works correctly

### Authentication
- [ ] Accessed app through Whop iframe
- [ ] User authentication works
- [ ] User token is received correctly
- [ ] User data displays correctly

### Database
- [ ] Supabase connection works
- [ ] Can read data from Supabase
- [ ] Can write data to Supabase
- [ ] API routes work correctly

### Webhooks
- [ ] Test webhook sent from Whop
- [ ] Webhook received at `/api/webhooks`
- [ ] Webhook processed successfully
- [ ] Checked Vercel function logs

### In-App Purchases
- [ ] Purchase button works
- [ ] Checkout configuration created
- [ ] In-app purchase modal opens
- [ ] Payment flow completes
- [ ] Webhook grants access after payment

## Post-Deployment

### Documentation
- [ ] Updated any documentation with production URL
- [ ] Shared production URL with team
- [ ] Documented environment variable sources

### Monitoring
- [ ] Set up Vercel monitoring (optional)
- [ ] Checked Vercel analytics (optional)
- [ ] Verified function logs are accessible

### Security
- [ ] Verified no secrets in codebase
- [ ] All sensitive variables in Vercel only
- [ ] Team access reviewed
- [ ] 2FA enabled on Vercel account (recommended)

## Rollback Plan

If something goes wrong:

1. **Revert to Previous Deployment**:
   - Go to Vercel dashboard
   - Navigate to "Deployments"
   - Find previous successful deployment
   - Click "..." → "Promote to Production"

2. **Fix and Redeploy**:
   - Fix issues locally
   - Test locally
   - Push to GitHub
   - Auto-deploy will trigger

## Success Criteria

✅ App is accessible at production URL
✅ All environment variables working
✅ Whop app settings updated
✅ Supabase configured correctly
✅ Webhooks receiving events
✅ Authentication working
✅ Database operations working
✅ In-app purchases working

## Support

If you encounter issues:

1. **Check Vercel Logs**: Dashboard → Your Project → Functions → Logs
2. **Check Build Logs**: Dashboard → Your Project → Deployments → Build Logs
3. **Verify Environment Variables**: Settings → Environment Variables
4. **Check Whop Webhooks**: Whop Dashboard → Your App → Webhooks
5. **Check Supabase Logs**: Supabase Dashboard → Logs

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Whop Developer Dashboard**: https://whop.com/developers
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repository**: https://github.com/basilerocco6-crypto/Tier-Maker

---

**Deployment Date**: _______________

**Production URL**: https://________________.vercel.app

**Status**: ⬜ Success  ⬜ Issues  ⬜ Pending

