# Supabase Settings Guide - Complete Configuration

## Answers to Your Questions

### 1. Sign In / Providers Settings

**Your Current Settings (from screenshot):**
- ✅ **Allow new users to sign up:** ON (green) - **CORRECT - KEEP ON**
- ❌ **Allow manual linking:** OFF (gray) - **CORRECT - KEEP OFF**
- ❌ **Allow anonymous sign-ins:** OFF (gray) - **CORRECT - KEEP OFF**
- ✅ **Confirm email:** ON (green) - **CORRECT - KEEP ON**

**Recommendation:** ✅ **No changes needed** - Your settings are perfect for OAuth.

### 2. OAuth Server Settings

**Your Current Settings (from screenshot):**
- ✅ **Enable the Supabase OAuth Server:** ON (green)
- ✅ **Site URL:** `https://twitify.tech` - **CORRECT**
- ⚠️ **Authorization Path:** `/oauth/consent` - **NOT NEEDED**
- ❌ **Allow Dynamic OAuth Apps:** OFF (gray) - **CORRECT**

**What OAuth Server Does:**
- Makes YOUR Supabase project act as an OAuth provider (like Google/GitHub)
- Allows OTHER apps to authenticate users using YOUR Supabase project
- Requires implementing consent screens at `/oauth/consent`

**Do You Need It?**
- **NO** - You're using Twitter OAuth to authenticate YOUR users
- You're NOT providing OAuth services to other apps
- This feature is for advanced use cases

**Recommendation:** 
- **Disable "Enable the Supabase OAuth Server"** - Toggle to OFF
- Click "Save changes"
- This won't affect your Twitter OAuth flow

### 3. User Sessions Settings

**Your Current Settings (from screenshot):**
- ✅ **Detect and revoke compromised tokens:** ON (green) - **KEEP ON** (security best practice)
- ✅ **Refresh token reuse interval:** 10 seconds - **KEEP** (default is fine)
- ❌ **Enforce single session per user:** OFF (gray) - **OPTIONAL**
- ✅ **Time-box user sessions:** 0 (never) - **KEEP** (or set to 7-30 days if you want)

**Recommendation:** ✅ **No changes needed** - Your settings are fine.

**Optional:** If you want users to only be logged in on one device at a time, enable "Enforce single session per user". Otherwise, keep it off.

### 4. Redirect URLs

**Your Current Settings (from screenshot):**
- ✅ **Site URL:** `https://twitify.tech` - **CORRECT**
- ✅ **Redirect URLs:** `https://twitify.tech/auth/callback` - **CORRECT**

**Do You Need More Redirect URLs?**
- **NO** - You only need one redirect URL for OAuth callback
- The current setup is correct

**Note:** If you add more redirect URLs (like for preview deployments), you can, but it's not necessary for production.

### 5. Auth Hooks

**Do You Need Auth Hooks?**
- **NO** - Not needed for basic OAuth flow

**What Auth Hooks Do:**
- Customize authentication flow with Postgres functions or HTTP endpoints
- Add custom logic before/after sign-in
- Integrate with external services
- Transform user data

**When You'd Need Them:**
- Custom user data transformation
- Integration with external APIs during sign-in
- Custom validation logic
- Sending data to external services

**For Your Use Case:** Standard Twitter OAuth doesn't need hooks. Keep it empty.

## Summary: What to Change

### ✅ Keep As-Is (No Changes):
1. Sign In / Providers settings
2. User Sessions settings
3. URL Configuration (Site URL and Redirect URLs)
4. Auth Hooks (leave empty)

### 🔴 Change This:
1. **Disable OAuth Server** (not needed for your use case)
   - Go to: Auth → OAuth Server
   - Toggle "Enable the Supabase OAuth Server" to OFF
   - Click "Save changes"

### 🔴 CRITICAL: Fix Credential Typos
See `CRITICAL_CREDENTIAL_TYPOS_FIX.md` for detailed instructions.

## Where Do Credentials Come From?

**Twitter Developer Portal:**
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Select your app
3. Go to: **"Keys and tokens"** tab
4. Look for:
   - **OAuth 2.0 Client ID** → Copy this
   - **OAuth 2.0 Client Secret** → Copy this (click "Regenerate" if needed)

**Can They Be Changed?**
- **YES** - You can regenerate them in Twitter Developer Portal
- **BUT** - If you regenerate, you MUST update:
  1. Supabase Dashboard → Auth → Providers → X / Twitter (OAuth 2.0)
  2. Vercel Environment Variables (if using for direct Twitter API calls)

**Important:** Always copy-paste credentials, never type them manually. Typos are easy to make and hard to spot.

