# 🚀 Domain Migration Guide: twitify.tech

## ✅ Code Status: READY
All code is already domain-agnostic and will work automatically with `twitify.tech`. No code changes needed!

## Phase 1: Vercel Domain Configuration

### Step 1.1: Add Domain in Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select your **Twitify** project
3. Click **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `twitify.tech`
6. Click **"Add"**
7. Vercel will show you DNS configuration instructions

### Step 1.2: Configure DNS at Your Domain Registrar
**Where you bought twitify.tech** (GoDaddy, Namecheap, Cloudflare, etc.)

**Vercel will show you the exact records, but typically:**

**Option A: Using A Record (Root Domain)**
- **Type:** A
- **Name:** @ (or blank/root)
- **Value:** `76.76.21.21` (Vercel will show the exact IP)
- **TTL:** 3600 (or default)

**Option B: Using CNAME (Recommended)**
- **Type:** CNAME
- **Name:** @
- **Value:** `cname.vercel-dns.com`
- **TTL:** 3600

**For WWW Subdomain (Optional):**
- **Type:** CNAME
- **Name:** www
- **Value:** `cname.vercel-dns.com`

**⚠️ IMPORTANT:** Follow the EXACT DNS records shown in Vercel dashboard - they may differ!

### Step 1.3: Wait for DNS & SSL
- DNS propagation: 15-30 minutes (can take up to 48 hours)
- SSL certificate: Auto-issued by Vercel (5-10 minutes after DNS)
- **Check Status:** Vercel Dashboard → Domains → Should show "Valid" ✅

## Phase 2: Update Environment Variables

### Step 2.1: Update NEXT_PUBLIC_APP_URL in Vercel
1. Go to: Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find: `NEXT_PUBLIC_APP_URL`
3. Click **Edit**
4. Change value to: `https://twitify.tech`
5. Make sure it's enabled for: **Production, Preview, Development** ✅
6. Click **Save**

### Step 2.2: Redeploy
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Select **"Use existing Build Cache"** (optional, faster)
4. Click **"Redeploy"**

## Phase 3: Update Twitter OAuth

### Step 3.1: Update Twitter Developer Portal
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Select your app
3. Go to **"User authentication settings"**
4. **Add Callback URL:**
   - Click **"Add"** or **"Edit"**
   - Add: `https://twitify.tech/api/auth/twitter`
   - Keep existing URLs (localhost + old vercel.app) for now
5. **Update Website URL:**
   - Change to: `https://twitify.tech`
6. **Verify Settings:**
   - App permissions: **Read and Write** ✅
   - Type of App: **Web App, Automated App or Bot** ✅
7. Click **"Save"**

## Phase 4: Update Supabase OAuth

### Step 4.1: Update Supabase Redirect URLs
1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers
2. Click on **Twitter** provider
3. Scroll to **"Redirect URLs"** section
4. Click **"Add URL"** or **"Add another redirect URL"**
5. Add: `https://twitify.tech/auth/callback`
6. Keep existing: `https://twitify-sepia.vercel.app/auth/callback` (for now)
7. **Verify Credentials:**
   - Client ID: `OcLE9UEtrOTtbwvmIyg6xJPN5`
   - Client Secret: `FaeGB8rBml7HgDGc4nPRKYbzVMrKn3e6DxHoYiMup3qkwlbw3V`
8. Click **"Save"**

**Note:** The Supabase callback URL (`https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`) stays the same - don't change it!

## Phase 5: Update Stripe Webhook

### Step 5.1: Update Stripe Webhook URL
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Find your webhook endpoint
3. Click **"Edit"** or click on the webhook
4. **Update Webhook URL:**
   - Change to: `https://twitify.tech/api/stripe/webhook`
5. **Verify Events Selected:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
6. Click **"Save"**

**Note:** If you create a new webhook, update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables.

## Phase 6: Testing Checklist

### ✅ Domain & SSL
- [ ] DNS records configured at registrar
- [ ] Domain shows "Valid" in Vercel dashboard
- [ ] SSL certificate issued (check Vercel dashboard)
- [ ] Can access `https://twitify.tech` (shows your app)

### ✅ Environment Variables
- [ ] `NEXT_PUBLIC_APP_URL` = `https://twitify.tech` in Vercel
- [ ] Redeployed after env var change
- [ ] Site loads correctly at `https://twitify.tech`

### ✅ OAuth Flow
- [ ] Visit `https://twitify.tech/auth/login`
- [ ] Click "Sign in with Twitter"
- [ ] Redirects to Twitter authorization
- [ ] After authorizing, redirects back to `https://twitify.tech/auth/callback`
- [ ] User successfully logged in
- [ ] Redirected to dashboard

### ✅ Stripe Webhook
- [ ] Webhook URL updated in Stripe
- [ ] Test webhook event sent successfully
- [ ] Webhook receives events (check Stripe dashboard → Webhooks → Recent events)

### ✅ Application Features
- [ ] Dashboard loads
- [ ] Content suggestions work
- [ ] Schedule functionality works
- [ ] Analytics load
- [ ] Billing/checkout flow works

## Phase 7: Cleanup (After 24-48 Hours)

Once everything works perfectly with `twitify.tech`:

### Optional Cleanup:
- [ ] Remove `https://twitify-sepia.vercel.app/api/auth/twitter` from Twitter (optional)
- [ ] Remove `https://twitify-sepia.vercel.app/auth/callback` from Supabase (optional)

**Note:** The old Vercel domain will continue to work as a fallback, so cleanup is optional.

## Quick Reference: All URLs After Migration

- **Production URL:** `https://twitify.tech`
- **Twitter Callback:** `https://twitify.tech/api/auth/twitter`
- **Supabase Redirect:** `https://twitify.tech/auth/callback`
- **Stripe Webhook:** `https://twitify.tech/api/stripe/webhook`
- **Environment Variable:** `NEXT_PUBLIC_APP_URL=https://twitify.tech`

## Troubleshooting

### DNS Not Working
- Check DNS records match exactly what Vercel shows
- Use DNS checker: https://dnschecker.org
- Wait up to 48 hours for full propagation

### SSL Certificate Not Issued
- Wait 5-10 minutes after DNS is valid
- Check Vercel dashboard → Domains → SSL status
- Vercel automatically issues SSL certificates

### OAuth Not Working
- Verify URLs match exactly (no trailing slashes)
- Check both Twitter and Supabase URLs are updated
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- Test OAuth flow end-to-end

### Webhook Not Receiving Events
- Verify webhook URL is correct in Stripe
- Check webhook secret matches in Vercel
- Test webhook from Stripe dashboard

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all URLs match exactly
4. Ensure environment variables are set correctly

---

**Estimated Time:** 1-2 hours (mostly waiting for DNS/SSL)
**Code Changes Required:** None ✅
**Status:** Ready to migrate!

