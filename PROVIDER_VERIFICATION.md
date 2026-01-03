# Provider Verification Checklist

## Critical: Use the Correct Provider

Supabase has **two** Twitter providers:
1. **"X / Twitter (OAuth 2.0)"** ✅ **USE THIS ONE**
2. **"Twitter (Deprecated)"** ❌ **DO NOT USE THIS**

Using the deprecated provider will cause OAuth to fail.

## Step-by-Step Verification

### Step 1: Navigate to Providers Page

1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers
2. You should see a list of authentication providers

### Step 2: Verify "X / Twitter (OAuth 2.0)" is Enabled

**Look for:**
- Provider name: **"X / Twitter (OAuth 2.0)"**
- Status: Should show **"Enabled"** with a green checkmark ✅
- Icon: Should show the X/Twitter logo (not the old bird logo)

**If NOT enabled:**
1. Click on **"X / Twitter (OAuth 2.0)"**
2. Toggle the switch to **ON** (should turn green)
3. Continue to Step 3

### Step 3: Verify Credentials Are Correct

**In the "X / Twitter (OAuth 2.0)" provider settings:**

1. **Client ID Field:**
   - Should contain: `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
   - ⚠️ **Critical:** Must have lowercase 'l' before 'NMEM' (not capital 'I')
   - Should NOT be empty

2. **Client Secret Field:**
   - Should contain: `HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz`
   - ⚠️ **Critical:** Must have '4OPlS' (number '4', capital 'O', capital 'P', lowercase 'l', capital 'S')
   - Should NOT be empty
   - Click the eye icon to reveal if hidden

3. **If credentials are wrong or empty:**
   - Delete the current value completely
   - Type the correct value exactly as shown above
   - Double-check for typos
   - Click **"Save"**

### Step 4: Verify "Twitter (Deprecated)" is Disabled

**Look for:**
- Provider name: **"Twitter (Deprecated)"**
- Status: Should show **"Disabled"** (grey, not green) ❌

**If it's enabled:**
1. Click on **"Twitter (Deprecated)"**
2. Toggle the switch to **OFF** (should turn grey)
3. Click **"Save"**

**Why:** Having both enabled can cause conflicts. Only use OAuth 2.0.

### Step 5: Verify Redirect URLs Are Configured

**Option A: Check in URL Configuration**
1. Go to: Auth → URL Configuration → Redirect URLs
2. Verify `https://twitify.tech/auth/callback` is in the list
3. If not, add it (see `SUPABASE_REDIRECT_URL_SETUP.md`)

**Option B: Check in Provider Settings**
1. In "X / Twitter (OAuth 2.0)" settings
2. Look for "Redirect URLs" or "Allowed Redirect URLs" section
3. Verify `https://twitify.tech/auth/callback` is listed

### Step 6: Save All Changes

1. After making any changes, click **"Save"** button
2. Wait **30-60 seconds** for changes to propagate
3. Don't navigate away immediately

## Complete Verification Checklist

### Provider Configuration
- [ ] "X / Twitter (OAuth 2.0)" is **Enabled** (green checkmark)
- [ ] "Twitter (Deprecated)" is **Disabled** (grey)
- [ ] Client ID is correct: `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
- [ ] Client Secret is correct: `HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz`
- [ ] Both credentials are NOT empty
- [ ] Clicked "Save" after entering credentials

### Redirect URLs
- [ ] `https://twitify.tech/auth/callback` is added to redirect URLs
- [ ] URL is exactly as shown (no typos, correct protocol)
- [ ] Saved redirect URLs changes

### Testing
- [ ] Waited 30-60 seconds after saving
- [ ] Tested OAuth on `https://twitify.tech/auth/login`
- [ ] OAuth redirects to Twitter (not showing error)

## Common Mistakes

### Mistake 1: Using Deprecated Provider
**Symptom:** OAuth fails with "provider not enabled" error

**Fix:** Enable "X / Twitter (OAuth 2.0)" and disable "Twitter (Deprecated)"

### Mistake 2: Credential Typos
**Symptom:** OAuth fails with authentication errors

**Common typos:**
- Client ID: `INMEM` instead of `lNMEM` (lowercase 'l')
- Client Secret: `4OPIS` instead of `4OPlS` (lowercase 'l')

**Fix:** Copy-paste credentials exactly as shown above

### Mistake 3: Empty Credentials
**Symptom:** OAuth fails immediately

**Fix:** Enter both Client ID and Client Secret, then save

### Mistake 4: Not Saving Changes
**Symptom:** Changes don't take effect

**Fix:** Always click "Save" after making changes, then wait 30-60 seconds

### Mistake 5: Wrong Redirect URL
**Symptom:** HTTP 400 error about redirect URL

**Fix:** Add `https://twitify.tech/auth/callback` to redirect URLs whitelist

## Visual Indicators

### Correct Setup ✅
- "X / Twitter (OAuth 2.0)": **Green "Enabled"** badge
- "Twitter (Deprecated)": **Grey "Disabled"** badge
- Client ID field: Has value (not empty)
- Client Secret field: Has value (not empty, can be hidden)
- Redirect URLs: Contains `https://twitify.tech/auth/callback`

### Incorrect Setup ❌
- "X / Twitter (OAuth 2.0)": Grey/Disabled
- "Twitter (Deprecated)": Green/Enabled
- Client ID or Secret: Empty
- Redirect URLs: Missing `https://twitify.tech/auth/callback`

## After Verification

Once everything is verified:

1. **Wait 30-60 seconds** for Supabase to propagate changes
2. **Test OAuth flow:**
   - Visit: `https://twitify.tech/auth/login`
   - Click "Sign in with Twitter"
   - Should redirect to Twitter authorization page
3. **If errors persist:**
   - Check browser console for detailed error messages
   - Check Vercel logs for server-side errors
   - Verify all checklist items again

## Quick Reference

**Correct Provider:** "X / Twitter (OAuth 2.0)" ✅

**Correct Client ID:** `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`

**Correct Client Secret:** `HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz`

**Correct Redirect URL:** `https://twitify.tech/auth/callback`

**Provider to Disable:** "Twitter (Deprecated)" ❌

