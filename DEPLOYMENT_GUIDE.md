# Vercel Deployment Guide

This guide walks you through deploying your Whop Next.js app to Vercel with proper configuration.

## Prerequisites

- ✅ Your code is pushed to GitHub
- ✅ You have a Vercel account (sign up at vercel.com if needed)
- ✅ You have access to Whop Developer Dashboard
- ✅ You have access to Supabase Dashboard

## Step 1: Connect GitHub to Vercel

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com) and sign in
2. **Add New Project**: Click "Add New Project" or the "+" button
3. **Import Repository**: 
   - Select your GitHub account
   - Find and select your repository (`basilerocco6-crypto/Tier-Maker`)
   - Click "Import"
4. **Auto-Detection**: Vercel will automatically detect Next.js

## Step 2: Configure Environment Variables

⚠️ **Critical**: Before deploying, add ALL environment variables!

1. **Go to Project Settings**: 
   - In your Vercel project dashboard
   - Click "Settings" tab
   - Navigate to "Environment Variables" section

2. **Add Environment Variables**: Add each of these variables:

   ### Whop Configuration
   ```
   WHOP_API_KEY
   ```
   - Value: Your Whop API key from Whop Developer Dashboard
   - Environment: Production, Preview, Development

   ```
   NEXT_PUBLIC_WHOP_APP_ID
   ```
   - Value: Your Whop App ID from Whop Developer Dashboard
   - Environment: Production, Preview, Development

   ```
   NEXT_PUBLIC_WHOP_AGENT_USER_ID
   ```
   - Value: Your Whop Agent User ID from Whop Developer Dashboard
   - Environment: Production, Preview, Development

   ```
   NEXT_PUBLIC_WHOP_COMPANY_ID
   ```
   - Value: Your Whop Company ID from Whop Developer Dashboard
   - Environment: Production, Preview, Development

   ```
   WHOP_WEBHOOK_SECRET
   ```
   - Value: Your Whop Webhook Secret from Whop Developer Dashboard
   - Environment: Production, Preview, Development
   - ⚠️ Keep this secret! Never expose it in client-side code

   ### Supabase Configuration
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```
   - Value: Your Supabase project URL
   - Get from: Supabase Dashboard → Settings → API
   - Environment: Production, Preview, Development

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   - Value: Your Supabase anonymous key
   - Get from: Supabase Dashboard → Settings → API
   - Environment: Production, Preview, Development

   ```
   SUPABASE_SERVICE_ROLE_KEY
   ```
   - Value: Your Supabase service role key
   - Get from: Supabase Dashboard → Settings → API
   - Environment: Production, Preview, Development
   - ⚠️ Keep this secret! Never expose it in client-side code

3. **Set Environment Scope**: 
   - For each variable, set scope to: **"Production, Preview, and Development"**
   - This ensures variables work in all environments

4. **Copy from .env.development.local**: 
   - Open your local `.env.development.local` file
   - Copy the values (not the variable names)
   - Paste into Vercel environment variables

## Step 3: Configure Build Settings

Vercel should auto-detect Next.js, but verify:

1. **Framework Preset**: Should be "Next.js"
2. **Build Command**: Should be `pnpm build` (auto-detected)
3. **Install Command**: Should be `pnpm install` (auto-detected)
4. **Output Directory**: Should be `.next` (auto-detected)

If using pnpm (recommended):
- Vercel will auto-detect `pnpm` from your `package.json` `packageManager` field

## Step 4: Deploy

1. **Review Configuration**: 
   - Double-check all environment variables are set
   - Verify build settings are correct

2. **Click "Deploy"**: 
   - Click the "Deploy" button
   - Wait for the build to complete (usually 2-5 minutes)

3. **Monitor Build Logs**: 
   - Watch the build process in real-time
   - Check for any errors or warnings
   - Build should complete successfully

4. **Copy Production URL**: 
   - After deployment, you'll get a URL like: `your-app.vercel.app`
   - Copy this URL - you'll need it for next steps

## Step 5: Update Whop App Settings

1. **Go to Whop Developer Dashboard**:
   - Visit [whop.com/developers](https://whop.com/developers)
   - Navigate to your app

2. **Update Base URL**:
   - Go to "Settings" or "App Settings"
   - Find "Base URL" or "App URL" field
   - Set it to: `https://your-app.vercel.app`
   - **Important**: Include the `https://` prefix

3. **Update Webhook URL** (if configured):
   - Go to "Webhooks" section
   - Update webhook endpoint to: `https://your-app.vercel.app/api/webhooks`
   - Verify webhook secret matches `WHOP_WEBHOOK_SECRET` in Vercel

4. **Save Changes**: Click "Save" or "Update"

## Step 6: Configure Supabase for Production

1. **Go to Supabase Dashboard**:
   - Visit your Supabase project dashboard
   - Navigate to "Authentication" → "URL Configuration"

2. **Update Site URL**:
   - Set "Site URL" to: `https://your-app.vercel.app`

3. **Add Redirect URLs**:
   - Click "Redirect URLs"
   - Add: `https://your-app.vercel.app/**`
   - Add: `https://your-app.vercel.app/*`
   - Save changes

4. **Verify Allowed Origins** (if required):
   - Some Supabase features require allowed origins
   - Add: `https://your-app.vercel.app`

## Step 7: Automatic Deployments

Vercel automatically sets up:

### Production Deployments
- **Trigger**: Every push to `main` branch
- **URL**: Your production domain (e.g., `your-app.vercel.app`)
- **Status**: Automatic

### Preview Deployments
- **Trigger**: Pull requests to any branch
- **URL**: Unique preview URL (e.g., `your-app-git-branch.vercel.app`)
- **Status**: Automatic
- **Environment Variables**: Uses same as production

### Branch Deployments
- **Trigger**: Pushes to branches other than `main`
- **URL**: Unique branch URL
- **Status**: Optional (can be enabled in settings)

### SSL Certificates
- ✅ **Automatic**: Vercel handles SSL certificates automatically
- ✅ **HTTPS**: All deployments use HTTPS by default
- ✅ **Auto-renewal**: Certificates are automatically renewed

## Step 8: Test Production Deployment

After deployment, test these:

### 1. Basic Functionality
- [ ] Visit your production URL
- [ ] Verify app loads correctly
- [ ] Check for console errors
- [ ] Verify all pages are accessible

### 2. Authentication
- [ ] Access app through Whop iframe
- [ ] Verify user authentication works
- [ ] Check if user token is received correctly

### 3. Database Connection
- [ ] Test Supabase connection
- [ ] Verify data can be read/written
- [ ] Check API routes work

### 4. Webhooks
- [ ] Trigger a test webhook from Whop
- [ ] Verify webhook endpoint receives events
- [ ] Check webhook logs in Vercel dashboard

### 5. In-App Purchases
- [ ] Test purchase flow
- [ ] Verify checkout configuration works
- [ ] Check webhook processes payments

### 6. Environment Variables
- [ ] Verify all environment variables are loaded
- [ ] Check that sensitive variables are not exposed
- [ ] Test that public variables are accessible

## Troubleshooting

### Build Fails

**Error**: Build command fails
- **Solution**: Check build logs for specific errors
- **Common issues**:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies

**Error**: Environment variable not found
- **Solution**: Verify variable is set in Vercel dashboard
- **Check**: Variable name matches exactly (case-sensitive)

### App Doesn't Load

**Error**: Blank page or error
- **Solution**: Check browser console for errors
- **Common issues**:
  - Missing `NEXT_PUBLIC_*` variables
  - API routes failing
  - Supabase connection issues

### Webhooks Not Working

**Error**: Webhooks not receiving events
- **Solution**: 
  1. Verify webhook URL in Whop dashboard: `https://your-app.vercel.app/api/webhooks`
  2. Check `WHOP_WEBHOOK_SECRET` matches in both places
  3. Check Vercel function logs for errors

### Supabase Connection Fails

**Error**: Supabase connection errors
- **Solution**:
  1. Verify Supabase URLs are in allowed list
  2. Check environment variables are set correctly
  3. Verify Supabase project is active

## Environment Variable Checklist

Before deploying, verify you've added:

- [ ] `WHOP_API_KEY`
- [ ] `NEXT_PUBLIC_WHOP_APP_ID`
- [ ] `NEXT_PUBLIC_WHOP_AGENT_USER_ID`
- [ ] `NEXT_PUBLIC_WHOP_COMPANY_ID`
- [ ] `WHOP_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

All set to: **Production, Preview, and Development**

## Post-Deployment Checklist

After successful deployment:

- [ ] Production URL is accessible
- [ ] Whop app settings updated with production URL
- [ ] Supabase URLs configured for production
- [ ] Webhook URL updated in Whop dashboard
- [ ] Test all major features in production
- [ ] Verify environment variables are working
- [ ] Check Vercel function logs for any errors
- [ ] Set up monitoring/alerts (optional)
- [ ] Update any documentation with production URL

## Custom Domain (Optional)

To use a custom domain:

1. **Go to Vercel Project Settings**:
   - Navigate to "Domains" section
   - Click "Add Domain"
   - Enter your custom domain

2. **Configure DNS**:
   - Vercel will provide DNS records
   - Add them to your domain registrar

3. **Update Whop Settings**:
   - Update "Base URL" to your custom domain
   - Update webhook URL if needed

## Monitoring and Logs

### Vercel Dashboard
- **Deployments**: View all deployments and their status
- **Logs**: Real-time function logs
- **Analytics**: View performance metrics (if enabled)

### Function Logs
- Access via Vercel dashboard → Your project → Functions
- View logs for API routes and server functions
- Useful for debugging webhooks and API issues

## Security Best Practices

1. **Never commit secrets**: `.env*.local` files are in `.gitignore`
2. **Use environment variables**: Store all secrets in Vercel, not in code
3. **Rotate secrets regularly**: Change API keys and secrets periodically
4. **Monitor access**: Review Vercel team access regularly
5. **Enable 2FA**: Enable two-factor authentication on Vercel account

## Summary

✅ **GitHub**: Connected to Vercel
✅ **Environment Variables**: All configured
✅ **Deployed**: App is live on Vercel
✅ **Whop Settings**: Base URL updated
✅ **Supabase**: URLs configured
✅ **Webhooks**: Endpoint updated
✅ **Automatic Deployments**: Enabled
✅ **SSL**: Automatic HTTPS

Your app is now live in production! 🚀

## Quick Reference

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Whop Developer Dashboard**: [whop.com/developers](https://whop.com/developers)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)

