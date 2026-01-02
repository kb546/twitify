# Vercel Deployment Plan for Twitify

## Overview
Deploy to Vercel first, then configure OAuth with production URLs. This avoids Twitter's localhost restrictions.

## Pre-Deployment Checklist

### 1. Ensure All Files Are Ready
- [x] `.env.local` with all API keys
- [x] `package.json` with dependencies
- [x] Database migration file ready
- [ ] Git repository initialized
- [ ] `.gitignore` configured

### 2. Files That Need to Exist
Let me check what's missing and create them...

## Deployment Steps

### Step 1: Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Twitify app"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `twitify`)
3. **Don't** initialize with README
4. Copy the repository URL

### Step 3: Push to GitHub
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install --legacy-peer-deps`

### Step 5: Add Environment Variables in Vercel
Add ALL variables from `.env.local`:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Twitter:**
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`
- `TWITTER_BEARER_TOKEN`

**AI Services:**
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

**Stripe:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_ENTERPRISE_PRICE_ID`

**App Config:**
- `NEXT_PUBLIC_APP_URL` - **IMPORTANT:** Set this to your Vercel URL (e.g., `https://twitify.vercel.app`)
- `CRON_SECRET`

### Step 6: Deploy
Click **Deploy** and wait for build to complete.

### Step 7: Get Your Vercel URL
After deployment, you'll get a URL like:
- `https://twitify-xyz.vercel.app` (or your custom domain)

## Post-Deployment Configuration

### Step 8: Update Twitter OAuth Settings

1. Go to Twitter Developer Portal: https://developer.twitter.com/en/portal/dashboard
2. Navigate to your app → **User authentication settings**
3. Configure:
   - **Callback URI / Redirect URL:** `https://your-vercel-url.vercel.app/api/auth/twitter`
   - **Website URL:** `https://your-vercel-url.vercel.app` (this will work!)
   - **App permissions:** Read and Write
   - **Type of App:** Web App, Automated App or Bot

### Step 9: Update Supabase OAuth Settings

1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers
2. Click on **Twitter** provider
3. Configure:
   - **Client ID:** Your Twitter API Key
   - **Client Secret:** Your Twitter API Secret
   - The callback URL shown is correct: `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`
   - **Redirect URLs:** Add your Vercel URL: `https://your-vercel-url.vercel.app/auth/callback`

### Step 10: Update Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-vercel-url.vercel.app/api/stripe/webhook`
4. Save

### Step 11: Update Vercel Environment Variables

Update `NEXT_PUBLIC_APP_URL` in Vercel to your actual deployment URL:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
- Redeploy

## Understanding the OAuth Flow

### How It Works:
1. User clicks "Sign in with Twitter" on your app
2. User is redirected to Twitter for authorization
3. Twitter redirects to Supabase callback: `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`
4. Supabase processes the OAuth and redirects to your app: `https://your-vercel-url.vercel.app/auth/callback`
5. Your app handles the callback and logs the user in

### Important URLs:
- **Twitter Callback:** `https://your-vercel-url.vercel.app/api/auth/twitter` (set in Twitter)
- **Supabase Callback:** `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback` (automatic)
- **App Redirect:** `https://your-vercel-url.vercel.app/auth/callback` (set in Supabase)

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify build logs in Vercel dashboard
- Ensure `--legacy-peer-deps` is in install command

### OAuth Not Working
- Verify all callback URLs match exactly
- Check environment variables are set in Vercel
- Ensure `NEXT_PUBLIC_APP_URL` matches your Vercel URL

### Database Connection Issues
- Verify Supabase keys are correct
- Check that migration has been run
- Ensure RLS policies are enabled

## Next Steps After Deployment

1. ✅ Run Supabase migration (if not done)
2. ✅ Test OAuth flow
3. ✅ Test content generation
4. ✅ Test scheduling
5. ✅ Test Stripe checkout

## Quick Reference

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com/project/cwdfqloiodoburllwpqe
- **Twitter Developer Portal:** https://developer.twitter.com/en/portal/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com

