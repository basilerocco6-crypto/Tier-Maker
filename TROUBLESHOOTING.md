# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to save draft" Error

**Possible Causes:**
- Supabase tables don't exist yet
- Database connection issue
- Authentication issue

**Solution:**
1. Run the SQL schema in your Supabase SQL Editor:
   ```sql
   -- Copy contents from lib/supabase-schema.sql
   ```

2. Check your Supabase connection:
   - Verify `.env.development.local` has correct Supabase credentials
   - Check Supabase project is active

3. Check browser console for detailed error messages

### 2. Authentication Errors

**If you see "Unauthorized" errors:**

The API routes now use `getUserId()` which:
- Works in development mode (returns null if no token)
- Requires valid Whop token in production

For local development, the API will accept requests even without auth.

### 3. Database Tables Don't Exist

**Error:** `relation "tier_list_templates" does not exist`

**Solution:**
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the SQL from `lib/supabase-schema.sql`
4. Verify tables were created in the Table Editor

### 4. Image Upload Not Working

**Current Implementation:**
- Images are stored as base64 data URLs in the database
- This works for small images but not scalable

**For Production:**
- Set up Supabase Storage bucket
- Upload images to storage
- Store URLs in database instead of base64

### 5. Navigation Not Working

**Issue:** `navigate is not a function`

**Solution:**
The code now handles both:
- Whop iframe: Uses `useIframeSdk().navigate()`
- Localhost: Falls back to `window.location.href`

This should work automatically.

### 6. Drag and Drop Not Working

**Check:**
- @dnd-kit packages are installed
- Browser console for DnD errors
- Ensure items have proper IDs

### 7. API Route Errors

**To debug:**
1. Check browser Network tab for API requests
2. Look at response status and error messages
3. Check server logs in terminal

### 8. Type Errors

**If you see TypeScript errors:**
- Run `pnpm install` to ensure all dependencies are installed
- Check that `lib/types.ts` exports are correct

## Getting Help

1. Check browser console for detailed error messages
2. Check terminal/server logs
3. Verify all environment variables are set
4. Ensure Supabase tables exist and are configured correctly

