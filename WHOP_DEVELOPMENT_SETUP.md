# Whop Development Setup Guide

## Running in Whop Iframe

When accessing your app through the Whop iframe, you need to:

### 1. Ensure Dev Proxy is Running

The dev script includes the Whop proxy:
```bash
pnpm dev
```

This runs `whop-proxy` which should:
- Inject the Whop user token into requests
- Handle CORS for Whop iframe
- Enable localhost development

### 2. Check Dev Proxy Configuration

Verify your `.env.development.local` has:
```
WHOP_API_KEY=your_api_key
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id
WHOP_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Access via Whop Dashboard

1. Go to your Whop app dashboard
2. Enable "Localhost Mode" or "Development Mode"
3. Access the app through the Whop iframe
4. The dev proxy should inject the token automatically

### 4. Troubleshooting Token Errors

If you see "Whop user token not found" even in Whop iframe:

1. **Check dev proxy is running:**
   - Look for `whop-proxy` process in terminal
   - Should see proxy messages when starting `pnpm dev`

2. **Check Whop Dashboard settings:**
   - Ensure "Localhost Mode" is enabled
   - Verify your app ID matches `NEXT_PUBLIC_WHOP_APP_ID`

3. **Check environment variables:**
   - All Whop env vars should be set
   - Restart dev server after changing env vars

4. **Check browser console:**
   - Look for any proxy-related errors
   - Check Network tab for token headers

### 5. Alternative: Use Dashboard Route

Instead of accessing via `/experiences/[experienceId]`, you can:
- Use the main dashboard at `/` 
- Access admin builder at `/admin/builder/new`
- These routes use `getUserId()` which allows null in development

The experience route specifically requires a token because it's meant to be accessed through Whop's experience flow.

