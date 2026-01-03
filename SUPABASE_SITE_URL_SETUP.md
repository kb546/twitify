# Supabase Site URL Configuration Guide

## Why This Is Critical

Supabase requires a **Site URL** to be configured separately from redirect URLs. This is the base URL of your application and is used for OAuth flows and email links.

**Site URL** and **Redirect URLs** are different:
- **Site URL**: The base URL of your application (e.g., `https://twitify.tech`)
- **Redirect URLs**: Specific paths where OAuth can redirect (e.g., `https://twitify.tech/auth/callback`)

If Site URL is not configured, OAuth might fail even if redirect URLs are correct.

## Step-by-Step Instructions

### Step 1: Navigate to URL Configuration

1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/url-configuration
2. Or navigate: **Authentication** → **URL Configuration** (in left sidebar under "CONFIGURATION")

### Step 2: Configure Site URL

1. Find the **"Site URL"** field (usually at the top)
2. **Enter exactly:** `https://twitify.tech`
   - ✅ Must include `https://`
   - ✅ Must be your production domain
   - ✅ No trailing slash
3. Click **"Save"** or **"Update"**

### Step 3: Verify Redirect URLs

While you're in URL Configuration, also verify:

1. Scroll to **"Redirect URLs"** section
2. Make sure `https://twitify.tech/auth/callback` is in the list
3. If not, add it (see `SUPABASE_REDIRECT_URL_SETUP.md`)

### Step 4: Save All Changes

1. After updating Site URL and checking Redirect URLs
2. Click **"Save"** or **"Update"** button
3. Wait **30-60 seconds** for changes to propagate

## Visual Guide

In the URL Configuration page, you should see:

**Site URL Section:**
- Field label: "Site URL"
- Input field: Should contain `https://twitify.tech`
- Description: Usually says something like "The base URL of your application"

**Redirect URLs Section:**
- List of allowed redirect URLs
- Should include: `https://twitify.tech/auth/callback`
- May have an "Add URL" or "Add new redirect URLs" button

## Common Issues

### Issue 1: Site URL Not Set

**Symptom:** OAuth fails even though redirect URLs are configured

**Solution:** Set Site URL to `https://twitify.tech`

### Issue 2: Site URL Has Trailing Slash

**Symptom:** OAuth might work but could cause issues

**Solution:** Remove trailing slash - should be `https://twitify.tech` (not `https://twitify.tech/`)

### Issue 3: Site URL Uses Preview Domain

**Symptom:** OAuth works on preview but not production

**Solution:** Change Site URL to production domain `https://twitify.tech`

### Issue 4: Site URL and Redirect URL Mismatch

**Symptom:** OAuth fails with redirect errors

**Solution:** 
- Site URL: `https://twitify.tech`
- Redirect URL: `https://twitify.tech/auth/callback`
- Both should use the same domain

## Verification Checklist

- [ ] Navigated to Supabase → Auth → URL Configuration
- [ ] Found "Site URL" field
- [ ] Set Site URL to `https://twitify.tech` (no trailing slash)
- [ ] Verified Redirect URLs include `https://twitify.tech/auth/callback`
- [ ] Clicked "Save" or "Update"
- [ ] Waited 30-60 seconds for propagation
- [ ] Tested OAuth flow

## Important Notes

1. **Site URL is Required:** Unlike redirect URLs which might be optional in some configurations, Site URL is typically required for OAuth to work.

2. **Exact Match:** Site URL must match your production domain exactly. No typos, correct protocol (https), no trailing slash.

3. **Propagation Time:** Changes can take 30-60 seconds to propagate across Supabase's infrastructure.

4. **Multiple Environments:** If you have multiple environments (dev, staging, production), you might need to configure Site URL for each, or use the production domain for all.

5. **Local Development:** For local development, Site URL can be `http://localhost:3000`, but make sure redirect URLs also include localhost URLs.

## After Configuration

Once Site URL is configured:

1. **Wait 30-60 seconds** for changes to propagate
2. **Test OAuth flow:**
   - Visit: `https://twitify.tech/auth/login`
   - Click "Sign in with Twitter"
   - Should redirect to Twitter (not show error)
3. **Check logs** if errors persist:
   - Vercel logs will show if Site URL mismatch is the issue
   - Supabase logs will show configuration errors

## Still Having Issues?

If you've configured Site URL and still getting errors:

1. **Double-check the URL** - Copy-paste exactly: `https://twitify.tech`
2. **Verify both Site URL and Redirect URLs** are configured
3. **Check provider** - Make sure "X / Twitter (OAuth 2.0)" is enabled
4. **Wait longer** - Sometimes propagation takes up to 2 minutes
5. **Check Supabase logs** - Look for specific error messages about Site URL

## Quick Reference

**Site URL:** `https://twitify.tech`

**Redirect URL:** `https://twitify.tech/auth/callback`

**Location:** Supabase Dashboard → Authentication → URL Configuration

