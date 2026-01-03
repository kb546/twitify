# 🔧 CRITICAL: Vercel Environment Variable Fix

## 🚨 The Problem

The redirect URL is still showing the preview domain because `NEXT_PUBLIC_APP_URL` is either:
1. Not set in Vercel
2. Set incorrectly
3. Not deployed yet

## ✅ Solution: Use API Route (Fixed in Code)

I've updated the code to use the server-side API route (`/api/auth/twitter`) instead of calling Supabase directly from the client. This ensures `NEXT_PUBLIC_APP_URL` is always used correctly.

## ⚠️ YOU MUST STILL DO THIS:

### Step 1: Verify Vercel Environment Variable

1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find: `NEXT_PUBLIC_APP_URL`
3. **Must be exactly:** `https://twitify.tech` (no trailing slash, no quotes)
4. **Must be enabled for:** ✅ Production, ✅ Preview, ✅ Development
5. Click **"Save"** if you made changes

### Step 2: Redeploy

**CRITICAL:** After setting/updating the environment variable, you MUST redeploy:

1. Go to: **Vercel Dashboard** → Your Project → **Deployments**
2. Find the latest deployment
3. Click the **three dots (⋯)** → **Redeploy**
4. Wait for deployment to complete (usually 2-3 minutes)

### Step 3: Verify It's Working

1. After redeploy completes, visit: `https://twitify.tech/auth/login`
2. Open browser console (F12)
3. Click "Sign in with Twitter"
4. Check the Network tab:
   - Look for the `authorize` request
   - Check the `redirect_to` parameter
   - **Should show:** `https://twitify.tech/auth/callback` ✅
   - **NOT:** `twitify-9debw4qlz-...vercel.app/auth/callback` ❌

## 🔍 How to Check if Environment Variable is Set

### Method 1: Check Debug Info on Login Page

After redeploying, visit `https://twitify.tech/auth/login`. You should see a debug info box showing:
- `NEXT_PUBLIC_APP_URL: https://twitify.tech` ✅
- If it shows "Not set", the environment variable isn't configured correctly

### Method 2: Check Vercel Logs

1. Go to: **Vercel Dashboard** → Your Project → **Logs**
2. Look for build logs
3. Search for `NEXT_PUBLIC_APP_URL`
4. Should see it being set during build

### Method 3: Check Network Request

1. Visit `https://twitify.tech/auth/login`
2. Open DevTools → Network tab
3. Click "Sign in with Twitter"
4. Find the `authorize` request
5. Check the `redirect_to` parameter in the URL

## 🎯 Why This Happens

- Environment variables in Next.js are **baked into the build** at build time
- If you set `NEXT_PUBLIC_APP_URL` after building, it won't be available
- You **must redeploy** after setting/updating environment variables
- The new code uses the API route (server-side) which always has access to environment variables

## ✅ Summary

1. ✅ Code fixed (uses API route now)
2. ⚠️ **YOU MUST:** Verify `NEXT_PUBLIC_APP_URL` is `https://twitify.tech` in Vercel
3. ⚠️ **YOU MUST:** Redeploy after verifying/updating the variable
4. ⚠️ **YOU MUST:** Test and verify the redirect URL is correct

## 🐛 If Still Not Working

If after redeploying you still see the preview URL:

1. **Double-check the environment variable:**
   - Go to Vercel → Settings → Environment Variables
   - Make sure `NEXT_PUBLIC_APP_URL` = `https://twitify.tech` (exactly, no trailing slash)
   - Make sure it's enabled for Production, Preview, Development

2. **Force a new deployment:**
   - Make a small change to any file (or add a comment)
   - Commit and push
   - This will trigger a new build with the environment variable

3. **Check the build logs:**
   - Go to Vercel → Deployments → Latest → View Build Logs
   - Look for any errors or warnings about environment variables

