# Production Setup Checklist

After setting environment variables in Vercel, complete these steps:

## ✅ 1. Automatic Deployments (Already Configured!)

When you connected your GitHub repo to Vercel, automatic deployments were enabled by default:

### Production Deployments
- **Trigger**: Every push to `main` branch
- **Status**: ✅ Already enabled
- **How it works**: 
  - Push to `main` → Vercel automatically detects changes
  - Build starts automatically
  - Deploys to production URL

### Preview Deployments
- **Trigger**: Pull requests to any branch
- **Status**: ✅ Already enabled
- **How it works**:
  - Create PR → Vercel creates preview deployment
  - Get unique preview URL
  - Test changes before merging

### SSL Certificates
- **Status**: ✅ Automatically handled by Vercel
- **HTTPS**: All deployments use HTTPS by default
- **Auto-renewal**: Certificates renew automatically

### Verify Automatic Deployments Are Working

1. **Check Vercel Dashboard**:
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Click "Deployments" tab
   - You should see deployments listed

2. **Test It**:
   - Make a small change locally
   - Push to `main`: `git push origin main`
   - Check Vercel dashboard - new deployment should appear automatically

## ✅ 2. Configure Supabase for Production

### Get Your Vercel Production URL

1. **Go to Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Select your project
   - Go to "Settings" → "Domains"
   - Or check "Deployments" → Latest deployment
   - Copy your production URL (e.g., `https://your-app.vercel.app`)

### Configure Supabase URLs

1. **Go to Supabase Dashboard**:
   - https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**:
   - Click "Authentication" in left sidebar
   - Click "URL Configuration"

3. **Update Site URL**:
   - Find "Site URL" field
   - Replace with: `https://your-app.vercel.app`
   - (Replace `your-app.vercel.app` with your actual Vercel URL)

4. **Add Redirect URLs**:
   - Scroll to "Redirect URLs" section
   - Click "Add URL"
   - Add: `https://your-app.vercel.app/**`
   - Click "Add URL" again
   - Add: `https://your-app.vercel.app/*`
   - Click "Save"

5. **Verify Allowed Origins** (if needed):
   - Some Supabase features may require allowed origins
   - If you have an "Allowed Origins" section, add: `https://your-app.vercel.app`

## ✅ 3. Update Whop App Settings

### Update Base URL

1. **Go to Whop Developer Dashboard**:
   - https://whop.com/developers
   - Navigate to your app

2. **Update Base URL**:
   - Go to "Settings" or "App Settings"
   - Find "Base URL" or "App URL"
   - Set to: `https://your-app.vercel.app`
   - (Include the `https://` prefix)
   - Save changes

### Update Webhook URL

1. **In Whop Dashboard**:
   - Navigate to "Webhooks" section
   - Update webhook endpoint to: `https://your-app.vercel.app/api/webhooks`
   - Verify `WHOP_WEBHOOK_SECRET` matches what you set in Vercel
   - Save changes

## ✅ 4. Test Production Deployment

### Test Checklist

- [ ] Visit production URL: `https://your-app.vercel.app`
- [ ] Verify app loads without errors
- [ ] Test authentication (access through Whop iframe)
- [ ] Verify database connection works
- [ ] Test a payment flow (if implemented)
- [ ] Check browser console for errors
- [ ] Verify environment variables are loaded

### Common Issues

**Issue**: "Whop user token not found"
- **Solution**: Ensure you're accessing through Whop iframe, not direct URL

**Issue**: Database connection fails
- **Solution**: Check Supabase URLs are configured correctly

**Issue**: Webhooks not working
- **Solution**: Verify webhook URL in Whop dashboard matches Vercel URL

## ✅ 5. Monitoring

### Vercel Dashboard
- **Deployments**: View all deployments and their status
- **Logs**: Real-time function logs
- **Analytics**: Performance metrics (if enabled)

### Function Logs
- **Access**: Vercel Dashboard → Your Project → Functions
- **View**: API route logs and errors
- **Debug**: Webhook and API issues

## Summary

✅ **Automatic Deployments**: Enabled by default
✅ **SSL Certificates**: Automatic
✅ **Supabase URLs**: Configure in Supabase dashboard
✅ **Whop Settings**: Update Base URL and Webhook URL

Your app should now be fully deployed and configured! 🚀

