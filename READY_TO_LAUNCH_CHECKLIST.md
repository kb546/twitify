# 🚀 Ready to Launch Checklist - twitify.tech

## ✅ What You've Done
- [x] Domain purchased: `twitify.tech`
- [x] Supabase Twitter provider configured with new credentials
- [x] Supabase callback URL verified: `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`

## ⚠️ Critical: What You MUST Do Now

### 1. Update Vercel Environment Variables (CRITICAL - 5 minutes)

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Update these 3 variables:**

```
TWITTER_CLIENT_ID=cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ
TWITTER_CLIENT_SECRET=HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz
NEXT_PUBLIC_APP_URL=https://twitify.tech
```

**Steps:**
1. Find each variable
2. Click "Edit"
3. Update the value
4. Make sure it's enabled for: **Production, Preview, Development** ✅
5. Click "Save"
6. **After updating all 3, go to Deployments → Redeploy**

### 2. Configure Twitter Developer Portal (CRITICAL - 5 minutes)

**Go to:** https://developer.twitter.com/en/portal/dashboard → Your App → User authentication settings

**Set these:**

- **Callback URI / Redirect URL:** 
  - **Primary:** `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`
  - **OR if Twitter allows multiple:** Also add `https://twitify.tech/api/auth/twitter`
  
- **Website URL:** `https://twitify.tech`

- **App permissions:** Read and Write ✅

- **Type of App:** Web App, Automated App or Bot ✅

**Important:** The callback URL should be the Supabase callback URL since Supabase handles the OAuth flow.

### 3. Verify Supabase Configuration (Already Done ✅)

**In Supabase:** https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers → Twitter

**Verify:**
- ✅ Client ID: `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
- ✅ Client Secret: `HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz`
- ✅ Enabled: Yes
- ✅ Callback URL: `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`

**About Redirect URLs:** If you don't see a redirect URL field, that's fine! Supabase uses the `redirectTo` parameter from your code (`app/api/auth/twitter/route.ts` line 21) to know where to redirect after OAuth. This is handled automatically.

### 4. Verify Domain Configuration (Should be Done ✅)

**In Vercel:** Settings → Domains
- [ ] `twitify.tech` shows as "Valid"
- [ ] SSL certificate issued (check status)

**DNS at Registrar:**
- [ ] DNS records configured correctly
- [ ] Domain resolves to Vercel

### 5. Verify Stripe Webhook (Should be Done ✅)

**In Stripe:** https://dashboard.stripe.com/test/webhooks
- [ ] Webhook URL: `https://twitify.tech/api/stripe/webhook`
- [ ] Events selected: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted

## 🧪 Final Testing (10 minutes)

### Test 1: Domain Access
- [ ] Visit `https://twitify.tech` - Should load your app
- [ ] No SSL errors
- [ ] Home page displays correctly

### Test 2: OAuth Flow (CRITICAL)
1. [ ] Visit `https://twitify.tech/auth/login`
2. [ ] Click "Sign in with Twitter"
3. [ ] Should redirect to Twitter authorization page
4. [ ] After authorizing, should redirect to `https://twitify.tech/auth/callback`
5. [ ] Should redirect to dashboard (`https://twitify.tech/dashboard`)
6. [ ] User should be logged in

### Test 3: Application Features
- [ ] Dashboard loads
- [ ] Can navigate between pages
- [ ] No console errors

## 🔍 Troubleshooting

### OAuth Not Working?

**Check 1: Twitter Callback URL**
- Must be: `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`
- Verify in Twitter Developer Portal

**Check 2: Vercel Environment Variables**
- `TWITTER_CLIENT_ID` must match Supabase
- `TWITTER_CLIENT_SECRET` must match Supabase
- `NEXT_PUBLIC_APP_URL` must be `https://twitify.tech`

**Check 3: Redeploy After Changes**
- After updating env vars, MUST redeploy
- Go to Deployments → Redeploy

**Check 4: Browser Console**
- Open browser DevTools → Console
- Look for errors during OAuth flow
- Check Network tab for failed requests

### Common Error Messages

**"Invalid callback URL"**
→ Check Twitter callback URL matches Supabase callback exactly

**"Redirect URI mismatch"**
→ Verify `NEXT_PUBLIC_APP_URL` is `https://twitify.tech` and redeployed

**"Unauthorized"**
→ Check Twitter Client ID/Secret match between Vercel and Supabase

## 📋 Quick Reference

**Your Credentials:**
- Twitter Client ID: `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
- Twitter Client Secret: `HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz`
- Supabase Callback: `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`
- Production URL: `https://twitify.tech`

**Vercel Environment Variables to Update:**
```
TWITTER_CLIENT_ID=cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ
TWITTER_CLIENT_SECRET=HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz
NEXT_PUBLIC_APP_URL=https://twitify.tech
```

## ✅ You're Ready When:

1. ✅ All 3 Vercel environment variables updated
2. ✅ Redeployed after env var changes
3. ✅ Twitter callback URL set to Supabase callback
4. ✅ Twitter website URL set to `https://twitify.tech`
5. ✅ OAuth flow works end-to-end
6. ✅ Domain loads correctly

## 🎯 Next Steps After Launch

1. Run Supabase migration (if not done)
2. Test all features
3. Monitor for errors
4. Set up monitoring/alerts

---

**Status:** Almost there! Just need to update Vercel environment variables and configure Twitter callback URL.

