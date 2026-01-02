# Twitter OAuth Setup Guide

## OAuth Settings Without a Domain

**Good news!** You don't need a domain to set up Twitter OAuth for local development. Here's what to do:

### For Local Development (Right Now)

1. **In Twitter Developer Portal:**
   - Go to your app settings: https://developer.twitter.com/en/portal/dashboard
   - Navigate to **User authentication settings**
   - Set **Callback URI / Redirect URL** to:
     ```
     http://localhost:3000/api/auth/twitter
     ```
   - Set **Website URL** to:
     ```
     http://localhost:3000
     ```
   - **App permissions:** Read and Write
   - **Type of App:** Web App

2. **In Supabase:**
   - Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers
   - Find **Twitter** provider
   - Enable it
   - Add your Twitter API credentials:
     - **API Key:** `OcLE9UEtrOTtbwvmIyg6xJPN5`
     - **API Secret:** `FaeGB8rBml7HgDGc4nPRKYbzVMrKn3e6DxHoYiMup3qkwlbw3V`
   - **Redirect URL:** `http://localhost:3000/auth/callback`

### For Production (After Deploying to Vercel)

Once you deploy to Vercel, you'll get a URL like: `https://your-app-name.vercel.app`

1. **Update Twitter OAuth Settings:**
   - Add a new callback URL:
     ```
     https://your-app-name.vercel.app/api/auth/twitter
     ```
   - Update Website URL:
     ```
     https://your-app-name.vercel.app
     ```
   - Keep the localhost URL for local development

2. **Update Supabase:**
   - Add the production callback URL:
     ```
     https://your-app-name.vercel.app/auth/callback
     ```

3. **Update .env.local in Vercel:**
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel URL

## Important Notes

- ✅ You can have **multiple callback URLs** in Twitter (both localhost and production)
- ✅ Twitter allows you to add multiple URLs, so you can test locally AND have production working
- ✅ Supabase also supports multiple redirect URLs
- ⚠️ Make sure the callback URLs match **exactly** (including http vs https)

## Testing Locally

1. Start your dev server:
   ```bash
   npm run dev --legacy-peer-deps
   ```

2. Navigate to: http://localhost:3000/auth/login

3. Click "Sign in with Twitter"

4. You should be redirected to Twitter for authorization

5. After authorizing, you'll be redirected back to your app

## Troubleshooting

**Error: "Invalid callback URL"**
- Check that the callback URL in Twitter matches exactly what's in your code
- Make sure you're using `http://localhost:3000` (not `https://`)
- Verify the URL doesn't have trailing slashes

**Error: "Redirect URI mismatch"**
- Double-check both Twitter and Supabase callback URLs
- Make sure they match exactly

**OAuth works locally but not in production**
- Update Twitter callback URLs to include your Vercel URL
- Update Supabase redirect URLs
- Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables

