# 🚀 Deploy to Vercel Now - Step by Step Guide

## Important Notes About OAuth

**You're absolutely right!** Twitter is rejecting `http://localhost:3000` as invalid. We need to deploy to Vercel first, then configure OAuth with the production URL.

**About Supabase Callback URL:**
The callback URL shown in Supabase (`https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`) is **CORRECT** - that's Supabase's OAuth callback endpoint. You don't need to change it. Here's how the flow works:

1. User clicks "Sign in with Twitter" → Goes to Twitter
2. Twitter redirects to → Supabase callback (`https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`)
3. Supabase processes OAuth → Redirects to your app (`https://your-vercel-url.vercel.app/auth/callback`)

## Pre-Deployment: Check Application Files

**⚠️ IMPORTANT:** Before deploying, we need to ensure all application files exist. It looks like some files may have been deleted. Let me check and restore them if needed.

## Deployment Steps

### Step 1: Prepare Git Repository

```bash
# Initialize git (if not already done)
git init

# Create .gitignore if it doesn't exist
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF

# Add all files
git add .

# Commit
git commit -m "Initial commit: Twitify ready for deployment"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `twitify` (or your preferred name)
3. **Don't** check "Initialize with README"
4. Click "Create repository"
5. Copy the repository URL (e.g., `https://github.com/yourusername/twitify.git`)

### Step 3: Push to GitHub

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your repository
5. **Important Settings:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install --legacy-peer-deps` ⚠️ **IMPORTANT**

### Step 5: Add Environment Variables in Vercel

Go to **Settings → Environment Variables** and add ALL of these (replace placeholders with your actual keys):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=your_stripe_pro_price_id
STRIPE_ENTERPRISE_PRICE_ID=your_stripe_enterprise_price_id

CRON_SECRET=your_random_secret_string
```

**⚠️ IMPORTANT:** Don't set `NEXT_PUBLIC_APP_URL` yet - we'll set it after deployment with the actual Vercel URL.

### Step 6: Deploy

Click **"Deploy"** and wait for the build to complete.

### Step 7: Get Your Vercel URL

After deployment succeeds, you'll see:
- **Production URL:** `https://twitify-xyz.vercel.app` (or similar)
- Copy this URL!

### Step 8: Update Environment Variables

1. Go back to Vercel → Settings → Environment Variables
2. Add/Update: `NEXT_PUBLIC_APP_URL` = `https://your-actual-vercel-url.vercel.app`
3. Go to **Deployments** tab
4. Click **"Redeploy"** on the latest deployment

### Step 9: Configure Twitter OAuth

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Your App → **User authentication settings**
3. Set:
   - **Callback URI / Redirect URL:** `https://your-vercel-url.vercel.app/api/auth/twitter`
   - **Website URL:** `https://your-vercel-url.vercel.app` ✅ This will work!
   - **App permissions:** Read and Write
   - **Type of App:** Web App, Automated App or Bot
4. **Save**

### Step 10: Configure Supabase OAuth

1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers
2. Click **Twitter** provider
3. Enable it
4. Set:
   - **Client ID:** Your Twitter API Key (from Twitter Developer Portal)
   - **Client Secret:** Your Twitter API Secret (from Twitter Developer Portal)
   - **Redirect URLs:** Add `https://your-vercel-url.vercel.app/auth/callback`
5. **Save**

**Note:** The callback URL shown (`https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`) is correct - that's Supabase's endpoint. You just need to add your app's redirect URL.

### Step 11: Update Stripe Webhook

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-vercel-url.vercel.app/api/stripe/webhook`
4. Save

### Step 12: Run Database Migration

1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/sql/new
2. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click **Run**
4. Should see "Success. No rows returned"

## Testing After Deployment

1. Visit your Vercel URL: `https://your-vercel-url.vercel.app`
2. Click "Sign in with Twitter"
3. Should redirect to Twitter for authorization
4. After authorizing, should redirect back to your app
5. You should be logged in!

## Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure `--legacy-peer-deps` is in install command
- Verify all files are committed to git

**OAuth Not Working:**
- Verify callback URLs match exactly (no trailing slashes)
- Check environment variables are set correctly
- Ensure `NEXT_PUBLIC_APP_URL` matches your Vercel URL

**Database Errors:**
- Run the migration if not done
- Check Supabase keys are correct

## Quick Checklist

- [ ] Git repository initialized and pushed to GitHub
- [ ] Deployed to Vercel
- [ ] All environment variables added to Vercel
- [ ] `NEXT_PUBLIC_APP_URL` set to Vercel URL
- [ ] Twitter OAuth configured with Vercel URL
- [ ] Supabase OAuth configured
- [ ] Stripe webhook updated
- [ ] Database migration run
- [ ] Test OAuth flow

Let's do this! 🚀

