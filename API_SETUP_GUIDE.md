# API Setup Guide for Twitify

This guide will help you set up all the required API keys and credentials for Twitify.

## Table of Contents
1. [Supabase](#supabase) ✅ Already Configured
2. [Twitter API](#twitter-api)
3. [OpenAI API](#openai-api)
4. [Anthropic API](#anthropic-api)
5. [Stripe](#stripe)
6. [Environment Variables Summary](#environment-variables-summary)

---

## Supabase ✅

**Status:** Already configured!

Your Supabase credentials are already set up in `.env.local`:
- **Project URL:** `https://cwdfqloiodoburllwpqe.supabase.co`
- **Anon Key:** Configured
- **Service Role Key:** Configured

### Next Step: Run Database Migration

1. Go to your Supabase project: https://app.supabase.com/project/cwdfqloiodoburllwpqe
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" - this means the migration ran successfully!

---

## Twitter API

### Step 1: Create a Twitter Developer Account

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign in with your Twitter account
3. Apply for a developer account (if you haven't already)
4. Accept the terms and conditions

### Step 2: Create a New App

1. Once approved, go to **Developer Portal** → **Projects & Apps**
2. Click **Create Project** or **Create App**
3. Fill in the details:
   - **App name:** Twitify (or your preferred name)
   - **App environment:** Development
   - **Use case:** Making automated posts, Reading and writing tweets
4. Click **Next** and complete the setup

### Step 3: Get API Keys

1. In your app dashboard, go to **Keys and tokens** tab
2. You'll need:
   - **API Key** → This is your `TWITTER_CLIENT_ID`
   - **API Secret** → This is your `TWITTER_CLIENT_SECRET`
   - **Bearer Token** → This is your `TWITTER_BEARER_TOKEN`

### Step 4: Configure OAuth Settings

1. Go to **User authentication settings**
2. Click **Set up** or **Edit**
3. Configure:
   - **App permissions:** Read and Write
   - **Type of App:** Web App
   - **Callback URL / Redirect URL:** 
     - Development: `http://localhost:3000/api/auth/twitter`
     - Production: `https://yourdomain.com/api/auth/twitter`
   - **Website URL:** `http://localhost:3000` (or your production URL)
4. Save the settings

### Step 5: Update .env.local

Add these to your `.env.local` file:

```env
TWITTER_CLIENT_ID=your_api_key_here
TWITTER_CLIENT_SECRET=your_api_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

**Important:** Keep these keys secret! Never commit them to git.

---

## OpenAI API

### Step 1: Create an OpenAI Account

1. Go to https://platform.openai.com
2. Sign up or log in
3. Add a payment method (OpenAI requires billing for API access)

### Step 2: Create an API Key

1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Give it a name (e.g., "Twitify")
4. Copy the key immediately (you won't be able to see it again!)
5. Click **Create secret key**

### Step 3: Update .env.local

Add this to your `.env.local` file:

```env
OPENAI_API_KEY=sk-...your_key_here
```

**Note:** OpenAI keys start with `sk-`

### Pricing

- Pay-as-you-go pricing
- GPT-4 Turbo: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- Check current pricing at https://openai.com/pricing

---

## Anthropic API

### Step 1: Create an Anthropic Account

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Add a payment method

### Step 2: Create an API Key

1. Go to https://console.anthropic.com/settings/keys
2. Click **Create Key**
3. Give it a name (e.g., "Twitify")
4. Copy the key (starts with `sk-ant-`)
5. Click **Create Key**

### Step 3: Update .env.local

Add this to your `.env.local` file:

```env
ANTHROPIC_API_KEY=sk-ant-...your_key_here
```

**Note:** Anthropic keys start with `sk-ant-`

### Pricing

- Claude 3 Opus: ~$15 per 1M input tokens, ~$75 per 1M output tokens
- Check current pricing at https://www.anthropic.com/pricing

---

## Stripe

### Step 1: Create a Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up for a free account
3. Complete the onboarding process

### Step 2: Get API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)
3. Make sure you're in **Test mode** for development
4. Copy both keys

### Step 3: Create Products and Prices

1. Go to **Products** in the Stripe dashboard
2. Click **Add product**

#### Create Pro Plan:
- **Name:** Pro Plan
- **Description:** Unlimited scheduling, AI suggestions, advanced analytics
- **Pricing:** 
  - **Price:** $29.00
  - **Billing period:** Monthly (recurring)
- Click **Save product**
- Copy the **Price ID** (starts with `price_...`) → This is `STRIPE_PRO_PRICE_ID`

#### Create Enterprise Plan:
- **Name:** Enterprise Plan
- **Description:** Everything in Pro plus team collaboration
- **Pricing:**
  - **Price:** $99.00
  - **Billing period:** Monthly (recurring)
- Click **Save product**
- Copy the **Price ID** (starts with `price_...`) → This is `STRIPE_ENTERPRISE_PRICE_ID`

### Step 4: Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL:** 
     - For local testing: Use ngrok: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
     - For production: `https://yourdomain.com/api/stripe/webhook`
   - **Description:** Twitify webhook
   - **Events to send:** Select these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_...`) → This is `STRIPE_WEBHOOK_SECRET`

### Step 5: Update .env.local

Add these to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_...your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret_here
STRIPE_PRO_PRICE_ID=price_...your_pro_price_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_...your_enterprise_price_id_here
```

### Testing Webhooks Locally

For local development, use ngrok:

```bash
# Install ngrok (if not installed)
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use this as your webhook URL in Stripe dashboard
```

---

## Environment Variables Summary

Here's a complete checklist of all environment variables:

### ✅ Already Configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 🔲 Still Need to Configure:

**Twitter API:**
- [ ] `TWITTER_CLIENT_ID`
- [ ] `TWITTER_CLIENT_SECRET`
- [ ] `TWITTER_BEARER_TOKEN`

**AI Services:**
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`

**Stripe:**
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRO_PRICE_ID`
- [ ] `STRIPE_ENTERPRISE_PRICE_ID`

**App Configuration:**
- [ ] `NEXT_PUBLIC_APP_URL` (already set to `http://localhost:3000`)
- [ ] `CRON_SECRET` (generate a random string, e.g., use `openssl rand -hex 32`)

---

## Quick Reference Links

- **Supabase Dashboard:** https://app.supabase.com/project/cwdfqloiodoburllwpqe
- **Twitter Developer Portal:** https://developer.twitter.com/en/portal/dashboard
- **OpenAI Platform:** https://platform.openai.com
- **Anthropic Console:** https://console.anthropic.com
- **Stripe Dashboard:** https://dashboard.stripe.com
- **ngrok (for local webhooks):** https://ngrok.com

---

## Security Best Practices

1. ✅ Never commit `.env.local` to git (it's already in `.gitignore`)
2. ✅ Use test/development keys for local development
3. ✅ Rotate keys regularly
4. ✅ Use different keys for development and production
5. ✅ Keep your service role keys secret (they have admin access)
6. ✅ Use environment variables in Vercel for production deployment

---

## Next Steps After Setup

1. ✅ Run the Supabase migration (see Supabase section above)
2. ✅ Configure Twitter OAuth in Supabase (Authentication → Providers → Twitter)
3. ✅ Test the app locally: `npm run dev --legacy-peer-deps`
4. ✅ Deploy to Vercel and add all environment variables there

---

## Troubleshooting

### Twitter OAuth Issues
- Make sure callback URLs match exactly (including http vs https)
- Check that app permissions are set to "Read and Write"
- Verify API keys are correct

### Stripe Webhook Issues
- Use ngrok for local testing
- Verify webhook signing secret is correct
- Check webhook events are selected correctly

### Supabase Connection Issues
- Verify project URL is correct
- Check that anon key and service role key are correct
- Ensure RLS policies are enabled

### AI API Issues
- Check API keys are valid and have credits
- Verify billing is set up for OpenAI/Anthropic
- Check rate limits if requests are failing

---

## Support

If you encounter issues:
1. Check the error messages in your terminal/console
2. Verify all environment variables are set correctly
3. Check API service status pages
4. Review the documentation links above

Good luck with your setup! 🚀


