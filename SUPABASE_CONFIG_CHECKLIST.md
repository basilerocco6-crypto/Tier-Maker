# Supabase Configuration Checklist

## Your Production URL
```
https://tier-maker-oh93.vercel.app
```

## Supabase Dashboard Configuration

### Step 1: Authentication → URL Configuration

**Site URL:**
```
https://tier-maker-oh93.vercel.app
```
✅ Correct (trailing slash optional, but recommended without)

**Redirect URLs:**
Add these patterns (click "Add URL" for each):
```
https://tier-maker-oh93.vercel.app/**
```
✅ Matches all paths (recommended)

```
https://tier-maker-oh93.vercel.app/*
```
✅ Matches single-level paths

```
https://tier-maker-oh93.vercel.app
```
✅ Root URL (optional, but safe)

### Step 2: Verify Configuration

After adding URLs, verify:
- [ ] Site URL is set to: `https://tier-maker-oh93.vercel.app`
- [ ] Redirect URLs include: `https://tier-maker-oh93.vercel.app/**`
- [ ] Redirect URLs include: `https://tier-maker-oh93.vercel.app/*`
- [ ] Clicked "Save" button

### Step 3: Test Configuration

1. **Test Authentication**:
   - Visit: `https://tier-maker-oh93.vercel.app`
   - Try to use any Supabase auth features
   - Check browser console for redirect errors

2. **Test Database Connection**:
   - Verify Supabase client works
   - Test API routes that use Supabase
   - Check Vercel function logs for Supabase errors

## Common Issues

### Issue: "redirect_to" must be a valid URL

**Solution**: Ensure redirect URLs include wildcards:
- `https://tier-maker-oh93.vercel.app/**` ✅
- `https://tier-maker-oh93.vercel.app/*` ✅
- `https://tier-maker-oh93.vercel.app/` ⚠️ (too specific)

### Issue: CORS errors

**Solution**: 
- Verify Site URL is correct
- Check Allowed Origins if that section exists
- Ensure no trailing slash inconsistencies

## Best Practices

✅ **Site URL**: Use root URL without trailing slash
✅ **Redirect URLs**: Use wildcards (`/**` and `/*`) for flexibility
✅ **Test**: Always test after configuration changes

## Summary

Your configuration:
- ✅ Site URL: `https://tier-maker-oh93.vercel.app`
- ⚠️ Redirect URLs: Add `/**` and `/*` patterns for full coverage

Add the wildcard patterns to redirect URLs for best compatibility! 🎯

