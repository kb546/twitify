# Supabase Redirect URL Setup Guide

## Why This Is Critical

Supabase validates all OAuth redirect URLs against a whitelist. Even if your code correctly passes `https://twitify.tech/auth/callback`, Supabase will reject it with a **400 Bad Request** error if this URL is not explicitly added to the allowed redirect URLs list.

## Step-by-Step Instructions

### Step 1: Navigate to Supabase Auth Settings

1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers
2. You should see a list of authentication providers

### Step 2: Access URL Configuration

**Option A: Via Redirect URLs Section (Recommended)**
1. In the left sidebar, look for **"URL Configuration"** under **"CONFIGURATION"**
2. Click on **"URL Configuration"**
3. Scroll down to find **"Redirect URLs"** section
4. Click **"Add new redirect URLs"** button

**Option B: Via Provider Settings**
1. Click on **"X / Twitter (OAuth 2.0)"** provider
2. Look for a **"Redirect URLs"** or **"Allowed Redirect URLs"** section
3. Click **"Add URL"** or **"Add new redirect URLs"**

### Step 3: Add Production Redirect URL

1. In the modal that appears, you'll see input fields for URLs
2. **Enter exactly:** `https://twitify.tech/auth/callback`
   - ✅ Must include `https://`
   - ✅ Must include `/auth/callback` path
   - ✅ No trailing slash
3. Click **"Save URLs"** or **"Save"**

### Step 4: Verify the URL Was Added

1. After saving, you should see `https://twitify.tech/auth/callback` in the list of redirect URLs
2. Make sure it's exactly as shown above (no typos, correct protocol)

### Step 5: Optional - Add Preview URLs (For Testing)

If you want to test OAuth on preview deployments, you can also add:
- `https://twitify-*.vercel.app/auth/callback` (if Supabase supports wildcards)
- OR add specific preview URLs as needed

**Note:** The code automatically uses `NEXT_PUBLIC_APP_URL` (production domain) for redirects, so preview URLs are optional.

## Common Issues

### Issue 1: "Redirect URL not found" Error

**Symptom:** HTTP 400 error with message about redirect URL

**Solution:**
- Verify the URL is added exactly as: `https://twitify.tech/auth/callback`
- Check for typos (twitify vs twitify, http vs https)
- Make sure you saved the changes

### Issue 2: URL Added But Still Getting Errors

**Possible Causes:**
1. **Wrong provider enabled** - Make sure "X / Twitter (OAuth 2.0)" is enabled, NOT "Twitter (Deprecated)"
2. **Propagation delay** - Wait 30-60 seconds after saving
3. **Wrong URL format** - Must be exact: `https://twitify.tech/auth/callback`

### Issue 3: Can't Find Redirect URLs Section

**Solution:**
- Look for "URL Configuration" in the left sidebar
- Or check the provider settings page
- Some Supabase versions may have it under "Auth" → "URL Configuration"

## Verification Checklist

- [ ] Navigated to Supabase Dashboard → Auth → URL Configuration
- [ ] Found "Redirect URLs" section
- [ ] Added `https://twitify.tech/auth/callback` exactly as shown
- [ ] Clicked "Save URLs" or "Save"
- [ ] Verified URL appears in the list
- [ ] Waited 30-60 seconds for changes to propagate
- [ ] Tested OAuth flow on `https://twitify.tech/auth/login`

## Screenshot Reference

When you click "Add new redirect URLs", you should see a modal with:
- Title: "Add new redirect URLs"
- Description: "This will add a URL to a list of allowed URLs that can interact with your Authentication services for this project."
- Input field(s) for URLs
- "Save URLs" button

Enter `https://twitify.tech/auth/callback` in the first input field and save.

## Important Notes

1. **Exact Match Required:** Supabase validates redirect URLs exactly. Even a small typo will cause rejection.

2. **Protocol Matters:** Must use `https://` (not `http://`) for production.

3. **Path Matters:** Must include `/auth/callback` path exactly.

4. **No Trailing Slash:** Should be `https://twitify.tech/auth/callback` (not `https://twitify.tech/auth/callback/`)

5. **Multiple URLs:** You can add multiple redirect URLs if needed (e.g., for different environments).

6. **Provider-Specific:** Some Supabase configurations may require redirect URLs per provider. Make sure it's configured for the Twitter provider.

## After Configuration

Once you've added the redirect URL:

1. **Wait 30-60 seconds** for Supabase to propagate the changes
2. **Test the OAuth flow:**
   - Visit: `https://twitify.tech/auth/login`
   - Click "Sign in with Twitter"
   - Should redirect to Twitter (not show error)
3. **Check logs** if errors persist:
   - Vercel logs will show the exact redirect URL being used
   - Supabase logs will show if the URL was rejected

## Still Having Issues?

If you've followed all steps and still getting errors:

1. **Double-check the URL** - Copy-paste exactly: `https://twitify.tech/auth/callback`
2. **Verify provider** - Make sure "X / Twitter (OAuth 2.0)" is enabled (not deprecated)
3. **Check Supabase logs** - Look for specific error messages
4. **Wait longer** - Sometimes propagation takes up to 2 minutes

