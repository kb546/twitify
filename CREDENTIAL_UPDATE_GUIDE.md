# Credential Update Guide - New Client Secret

## Your Updated Credentials

- **Client ID:** `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ` (unchanged)
- **Client Secret:** `Tqt-M-fmir5A-HxUg-XTFoDTC0TEqbCsaaHgeCPe3XwqFv3eDJ` (NEW - regenerated)

## Where to Update

### 1. Supabase Dashboard ✅ (You've done this)
- Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers
- Click: "X / Twitter (OAuth 2.0)"
- Update Client Secret field
- Click "Save"
- **Wait 120 seconds**

### 2. Vercel Environment Variables ✅ (You've done this)
- Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
- Update: `TWITTER_CLIENT_SECRET`
- **Redeploy** after updating

### 3. Twitter Developer Portal ✅ (You've done this)
- The new secret is already generated in Twitter Developer Portal

## Important: MCP Connection Won't Help

**The MCP connection shown in your screenshot is for:**
- Cursor IDE integration
- Database access from your IDE
- NOT related to OAuth configuration

**It will NOT help with OAuth issues.** OAuth is handled through Supabase's Auth API, not through MCP.

## Why It Might Still Not Work

Even after updating credentials, it might fail because:

1. **Supabase backend hasn't synced yet** (needs 60-120 seconds)
2. **Credentials still have typos** (double-check exact values)
3. **Provider needs to be toggled** (disable → wait → enable)
4. **Site URL or Redirect URL mismatch**
5. **Twitter Developer Portal callback URL not updated**

## Verification Steps

### Step 1: Verify Supabase Credentials Are Saved
1. Go to Supabase → Auth → Providers → X / Twitter (OAuth 2.0)
2. **Refresh the page** (F5)
3. Click the provider again
4. **Verify Client Secret matches exactly:**
   - Should be: `Tqt-M-fmir5A-HxUg-XTFoDTC0TEqbCsaaHgeCPe3XwqFv3eDJ`
   - Click eye icon to reveal and check
5. **If it's different or empty:** Re-enter and save again

### Step 2: Verify Twitter Developer Portal
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Select your app
3. Go to: "Keys and tokens"
4. **Verify:**
   - OAuth 2.0 Client ID: `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
   - OAuth 2.0 Client Secret: `Tqt-M-fmir5A-HxUg-XTFoDTC0TEqbCsaaHgeCPe3XwqFv3eDJ`
5. Go to: "User authentication settings"
6. **Verify Callback URI:** `https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback`
7. **Verify Website URL:** `https://twitify.tech`

### Step 3: Nuclear Reset (If Still Not Working)
1. **In Supabase:**
   - Go to Auth → Providers → X / Twitter (OAuth 2.0)
   - Toggle OFF
   - Wait 60 seconds
   - Toggle ON
   - Delete ALL text in Client ID field
   - Paste: `cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`
   - Delete ALL text in Client Secret field
   - Paste: `Tqt-M-fmir5A-HxUg-XTFoDTC0TEqbCsaaHgeCPe3XwqFv3eDJ`
   - Click "Save"
   - Wait 120 seconds

2. **Verify Site URL:**
   - Go to Auth → URL Configuration
   - Site URL: `https://twitify.tech` (no trailing slash)
   - Redirect URLs includes: `https://twitify.tech/auth/callback`
   - Click "Save"
   - Wait 60 seconds

3. **Test Again:**
   - Visit: `https://twitify.tech/api/debug/full-audit`
   - Should show: `"status": "all_checks_passed"`
   - Try OAuth: `https://twitify.tech/auth/login`

## Debugging: Check What Supabase Actually Has

After updating, use this to verify:

1. **Check audit endpoint:** `https://twitify.tech/api/debug/full-audit`
2. **Check test authorize:** `https://twitify.tech/api/debug/test-authorize`
3. **Check Vercel logs** for `[OAuth Init]` messages
4. **Check Supabase logs** (Auth Logs) for errors

## Common Issues After Regenerating

1. **Old secret still cached** - Wait longer (up to 5 minutes)
2. **Typo in new secret** - Copy-paste exactly, never type
3. **Twitter callback URL wrong** - Must be Supabase callback URL
4. **Site URL mismatch** - Must match exactly

## Next Steps

1. **Wait 2-3 minutes** after saving in Supabase
2. **Run full audit:** `https://twitify.tech/api/debug/full-audit`
3. **Check the error** - it will tell you exactly what's wrong
4. **Follow the fix steps** in the error message

