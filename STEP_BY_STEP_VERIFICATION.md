# Step-by-Step OAuth Verification

## Goal
Systematically verify EVERY component to find where OAuth breaks.

---

## Step 1: Verify Supabase Project ✅

**Test:** Visit `https://twitify.tech/api/debug/verify-supabase-project`

**Expected Result:**
```json
{
  "conclusion": "✅ CORRECT: Using the right Supabase project",
  "supabase": {
    "projectId": "cwdfqloiodoburllwpqe"
  }
}
```

**If wrong project:** Update `NEXT_PUBLIC_SUPABASE_URL` in Vercel

---

## Step 2: Run Minimal OAuth Test 🔍

**Test:** Visit `https://twitify.tech/api/debug/minimal-test`

**What it tests:**
1. Environment variables
2. Supabase client creation
3. OAuth URL generation
4. Authorize endpoint response

**Share the FULL output** - this will tell us exactly where it breaks.

---

## Step 3: Verify Supabase Dashboard Configuration 📋

**Go to:** https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers

### Check 1: Provider Selection
- [ ] Find **"X / Twitter (OAuth 2.0)"** (NOT "Twitter (Deprecated)")
- [ ] Toggle should be **ON** (green)
- [ ] Should show "Enabled" status

### Check 2: Client ID
- [ ] Click on "X / Twitter (OAuth 2.0)"
- [ ] Client ID field should contain: `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
- [ ] **CRITICAL:** Check for typos:
  - Should be lowercase `l` before `NMEM` (not capital `I`)
  - Should be: `cDhaU2UzbXpFWGpybj**l**NMEM4Mno6MTpjaQ`

### Check 3: Client Secret
- [ ] Client Secret field should be FILLED (not empty)
- [ ] Click eye icon to reveal
- [ ] **CRITICAL:** Should match what's in Twitter Developer Portal
- [ ] If you regenerated it, make sure NEW secret is in Supabase

### Check 4: Save Status
- [ ] Click "Save" button (even if nothing changed)
- [ ] Wait 60 seconds after saving
- [ ] Refresh the page
- [ ] Verify values are still there after refresh

### Check 5: Deprecated Provider
- [ ] Find "Twitter (Deprecated)"
- [ ] Should be **DISABLED** (grey toggle)
- [ ] If enabled, disable it

---

## Step 4: Verify Site URL & Redirect URLs 🌐

**Go to:** https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/url-configuration

### Site URL
- [ ] Should be: `https://twitify.tech`
- [ ] **NO trailing slash**
- [ ] Click "Save" if you changed it
- [ ] Wait 60 seconds

### Redirect URLs
- [ ] Should include: `https://twitify.tech/auth/callback`
- [ ] **NO trailing slash**
- [ ] Click "Save" if you added it
- [ ] Wait 60 seconds

---

## Step 5: Verify Twitter Developer Portal 🐦

**Go to:** https://developer.twitter.com/en/portal/dashboard

### Check 1: App Type
- [ ] App should be **OAuth 2.0** (not OAuth 1.0a)
- [ ] If it's OAuth 1.0a, create a NEW OAuth 2.0 app

### Check 2: Client ID & Secret
- [ ] Go to: Your App → Keys and tokens → OAuth 2.0 Client ID and Secret
- [ ] Client ID should match Supabase: `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
- [ ] Client Secret should match Supabase (the one you entered)

### Check 3: Callback URL
- [ ] Go to: Your App → User authentication settings
- [ ] Callback URI should be: `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`
- [ ] **OR** if Twitter allows multiple: Add both:
  - `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`
  - `https://twitify.tech/auth/callback`

### Check 4: App Permissions
- [ ] Should be: **Read and Write**
- [ ] Type of App: **Web App, Automated App or Bot**

---

## Step 6: Nuclear Reset (If Still Failing) 🔄

**Only do this if Steps 1-5 are correct but OAuth still fails:**

### In Supabase:
1. Go to: Auth → Providers → X / Twitter (OAuth 2.0)
2. **Toggle OFF** (disable)
3. **Wait 60 seconds**
4. **Delete Client ID** (make field empty)
5. **Delete Client Secret** (make field empty)
6. **Click Save**
7. **Wait 30 seconds**
8. **Toggle ON** (enable)
9. **Enter Client ID:** `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
10. **Enter Client Secret:** (from Twitter Developer Portal - the NEW one)
11. **Click Save**
12. **Wait 120 seconds** (important!)
13. **Refresh the page**
14. **Verify values are still there**

### Test Again:
- Visit: `https://twitify.tech/api/debug/minimal-test`
- Check if authorize endpoint works now

---

## Step 7: Test Actual OAuth Flow 🚀

**If minimal-test shows SUCCESS:**

1. Visit: `https://twitify.tech/auth/login`
2. Click "Sign in with Twitter"
3. Should redirect to Twitter/X login
4. After authorizing, should redirect back to dashboard

---

## What to Share With Me

After running these steps, share:

1. **Minimal test output:**
   - Visit: `https://twitify.tech/api/debug/minimal-test`
   - Copy the FULL JSON response

2. **Project verification:**
   - Visit: `https://twitify.tech/api/debug/verify-supabase-project`
   - Copy the FULL JSON response

3. **Supabase Dashboard:**
   - Screenshot of "X / Twitter (OAuth 2.0)" provider settings
   - (Blur out Client Secret, but show if field is filled)

4. **What step failed:**
   - Which step above shows an issue?

---

## Common Issues & Fixes

### Issue: "provider is not enabled"
**Fix:** Follow Step 6 (Nuclear Reset)

### Issue: "redirect URL mismatch"
**Fix:** Verify Step 4 (Site URL & Redirect URLs)

### Issue: "invalid client_id"
**Fix:** Verify Step 3 (Client ID in Supabase matches Twitter)

### Issue: "invalid client_secret"
**Fix:** Verify Step 3 (Client Secret matches) or regenerate in Twitter

---

## Key Insight

**The minimal-test endpoint will tell us EXACTLY where OAuth breaks.**

Once we see the output, we'll know:
- Is it environment variables?
- Is it Supabase client creation?
- Is it OAuth URL generation?
- Is it the authorize endpoint?

**Then we can fix the EXACT issue instead of guessing.**

