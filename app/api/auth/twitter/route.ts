import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cleanAppUrl = appUrl.replace(/\/$/, ""); // Remove trailing slash
    
    // Detect if accessed via preview domain
    const requestOrigin = request.headers.get("origin") || request.headers.get("referer") || "";
    const isPreviewDomain = requestOrigin.includes("vercel.app") && !requestOrigin.includes("twitify.tech");
    
    // Construct redirect URL - always use production domain from env var
    const redirectTo = `${cleanAppUrl}/auth/callback`;
    
    console.log("[OAuth Init] ===== OAuth Initialization =====");
    console.log("[OAuth Init] App URL (from env):", cleanAppUrl);
    console.log("[OAuth Init] Redirect URL:", redirectTo);
    console.log("[OAuth Init] Request Origin:", requestOrigin);
    console.log("[OAuth Init] Is Preview Domain:", isPreviewDomain);
    console.log("[OAuth Init] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Validate NEXT_PUBLIC_APP_URL is set (critical for production)
    if (!process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === "production") {
      console.error("[OAuth Init] CRITICAL: NEXT_PUBLIC_APP_URL not set in production!");
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent("Configuration Error: NEXT_PUBLIC_APP_URL is not set. Please configure it in Vercel environment variables.")}`,
          cleanAppUrl
        )
      );
    }

    if (isPreviewDomain) {
      console.warn("[OAuth Init] WARNING: Accessed via preview domain. OAuth will redirect to production domain:", cleanAppUrl);
    }

    // Pre-flight checks
    console.log("[OAuth Init] ===== Pre-Flight Checks =====");
    console.log("[OAuth Init] Supabase URL configured:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("[OAuth Init] Supabase Anon Key configured:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log("[OAuth Init] App URL configured:", !!process.env.NEXT_PUBLIC_APP_URL);
    console.log("[OAuth Init] Redirect URL:", redirectTo);
    
    // Verify Supabase project URL matches expected format
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes("cwdfqloiodoburllwpqe")) {
      console.warn("[OAuth Init] WARNING: Supabase URL might be for different project!");
      console.warn("[OAuth Init] Expected project ref: cwdfqloiodoburllwpqe");
      console.warn("[OAuth Init] Actual URL:", supabaseUrl.substring(0, 50) + "...");
    }

    const supabase = await createClient();
    
    if (!supabase) {
      console.error("[OAuth Init] Failed to create Supabase client");
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent("Authentication service unavailable. Please check Supabase configuration. Visit /api/debug/oauth-config for diagnostics.")}`,
          cleanAppUrl
        )
      );
    }

    // Test Supabase connection
    try {
      const { error: testError } = await supabase.auth.getUser();
      if (testError && !testError.message.includes("not authenticated")) {
        console.warn("[OAuth Init] Supabase connection test warning:", testError.message);
      }
    } catch (testErr: any) {
      console.warn("[OAuth Init] Supabase connection test failed:", testErr.message);
    }
    
    console.log("[OAuth Init] ============================");

    // This route initiates Twitter OAuth - users don't need to be authenticated yet
    // CRITICAL: For OAuth 2.0, Supabase uses "twitter" as provider name, but we need to ensure
    // the correct provider is enabled (X / Twitter OAuth 2.0, NOT deprecated)
    console.log("[OAuth Init] Calling Supabase signInWithOAuth with redirectTo:", redirectTo);
    
    // Try "twitter" provider (this is the correct name for OAuth 2.0 in Supabase)
    // Note: Even though it's called "X / Twitter (OAuth 2.0)" in UI, the provider name is still "twitter"
    const result = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo,
        queryParams: {
          // Force OAuth 2.0 flow
          response_type: "code",
        },
      },
    });
    
    const data = result.data;
    const error = result.error;

    if (error) {
      console.error("[OAuth Init] ===== Supabase OAuth Error =====");
      console.error("[OAuth Init] Provider Tried: twitter");
      console.error("[OAuth Init] Error Message:", error.message);
      console.error("[OAuth Init] Error Status:", error.status);
      console.error("[OAuth Init] Error Name:", error.name);
      console.error("[OAuth Init] Error Object:", JSON.stringify(error, null, 2));
      console.error("[OAuth Init] Redirect URL Used:", redirectTo);
      console.error("[OAuth Init] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50));
      console.error("[OAuth Init] =================================");
      
      // CRITICAL FIX: The error happens when Supabase validates the provider at /auth/v1/authorize
      // This means the provider might be enabled in UI but credentials are invalid or not saved
      let errorMessage = error.message || "Unknown error";
      const fixSteps: string[] = [];
      
      if (error.message?.includes("provider is not enabled") || 
          error.message?.includes("Unsupported provider") ||
          (error.status === 400)) {
        // This is the most common issue - provider appears enabled but isn't actually working
        errorMessage = `CRITICAL: Twitter provider is not properly enabled in Supabase.`;
        fixSteps.push(`🔴 STEP 1: Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers`);
        fixSteps.push(`🔴 STEP 2: Find "X / Twitter (OAuth 2.0)" (NOT "Twitter (Deprecated)")`);
        fixSteps.push(`🔴 STEP 3: Click on it to open settings`);
        fixSteps.push(`🔴 STEP 4: Toggle OFF, wait 5 seconds, then toggle ON`);
        fixSteps.push(`🔴 STEP 5: DELETE all text in Client ID field`);
        fixSteps.push(`🔴 STEP 6: Type exactly: cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`);
        fixSteps.push(`🔴 STEP 7: DELETE all text in Client Secret field (click eye icon first)`);
        fixSteps.push(`🔴 STEP 8: Type exactly: HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz`);
        fixSteps.push(`🔴 STEP 9: Click "Save" button at bottom`);
        fixSteps.push(`🔴 STEP 10: Wait 60 seconds, then refresh the page`);
        fixSteps.push(`🔴 STEP 11: Verify values are still there after refresh`);
        fixSteps.push(`🔴 STEP 12: Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/url-configuration`);
        fixSteps.push(`🔴 STEP 13: Set Site URL to: ${cleanAppUrl}`);
        fixSteps.push(`🔴 STEP 14: Add Redirect URL: ${redirectTo}`);
        fixSteps.push(`🔴 STEP 15: Click "Save" and wait 60 seconds`);
        fixSteps.push(`🔴 STEP 16: Make sure "Twitter (Deprecated)" is DISABLED`);
      } else if (error.message?.includes("redirect")) {
        errorMessage = `Redirect URL "${redirectTo}" is not whitelisted or Site URL not configured.`;
        fixSteps.push(`1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/url-configuration`);
        fixSteps.push(`2. Set Site URL to: ${cleanAppUrl}`);
        fixSteps.push(`3. Add Redirect URL: ${redirectTo}`);
        fixSteps.push(`4. Click "Save" and wait 60 seconds`);
      }
      
      const fullErrorMessage = `${errorMessage}\n\n${fixSteps.join('\n')}\n\n💡 TIP: After saving, wait 60 seconds before testing again. Supabase needs time to propagate changes.\n\n🔍 Check diagnostics: ${cleanAppUrl}/api/debug/oauth-config`;
      
      // Ensure error message is properly encoded
      const encodedError = encodeURIComponent(fullErrorMessage);
      
      // Redirect to login page with detailed error message
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodedError}`,
          cleanAppUrl
        )
      );
    }

    if (!data?.url) {
      console.error("[OAuth Init] No OAuth URL returned from Supabase");
      console.error("[OAuth Init] Provider Used: twitter");
      console.error("[OAuth Init] Redirect URL:", redirectTo);
      console.error("[OAuth Init] This usually means:");
      console.error("[OAuth Init] 1. Twitter provider is not enabled in Supabase");
      console.error("[OAuth Init] 2. Wrong provider is enabled (deprecated instead of OAuth 2.0)");
      console.error("[OAuth Init] 3. Redirect URL is not whitelisted:", redirectTo);
      console.error("[OAuth Init] 4. Site URL is not configured in Supabase");
      console.error("[OAuth Init] 5. Credentials are not saved properly");
      
      const errorMsg = `CRITICAL: Failed to generate OAuth URL. This means Supabase rejected the request before even creating the authorization URL.\n\n🔴 IMMEDIATE FIX:\n1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers\n2. Click "X / Twitter (OAuth 2.0)"\n3. Toggle OFF, wait 5s, toggle ON\n4. Re-enter Client ID: cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ\n5. Re-enter Client Secret: HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz\n6. Click "Save"\n7. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/url-configuration\n8. Set Site URL to: ${cleanAppUrl}\n9. Add Redirect URL: ${redirectTo}\n10. Wait 60 seconds before testing`;
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(errorMsg)}`,
          cleanAppUrl
        )
      );
    }
    
    // CRITICAL: Validate the URL before redirecting
    // If Supabase returns a URL but it's invalid, we'll catch it here
    try {
      const urlObj = new URL(data.url);
      if (!urlObj.hostname.includes("supabase.co")) {
        throw new Error("Invalid OAuth URL returned");
      }
      
      // CRITICAL: Test the authorize URL to ensure backend recognizes provider
      // This catches UI vs backend mismatch where UI shows enabled but backend doesn't
      console.log("[OAuth Init] Testing authorize URL to verify backend recognizes provider");
      try {
        const testResponse = await fetch(data.url, {
          method: "HEAD",
          redirect: "manual",
        });
        
        const status = testResponse.status;
        
        if (status >= 400) {
          // Backend rejected the request - get error details
          try {
            const errorResponse = await fetch(data.url, {
              method: "GET",
              redirect: "manual",
            });
            const errorText = await errorResponse.text();
            
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error_code === "validation_failed" || errorJson.msg?.includes("provider is not enabled")) {
                console.error("[OAuth Init] CRITICAL: Backend says provider is not enabled (UI vs backend mismatch)");
                console.error("[OAuth Init] Error from backend:", errorJson);
                
                const errorMsg = `CRITICAL: Supabase UI shows provider enabled but backend doesn't recognize it.\n\n🔴 NUCLEAR FIX REQUIRED:\n1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers\n2. Toggle "X / Twitter (OAuth 2.0)" OFF\n3. Wait 60 seconds\n4. Clear browser cache for Supabase dashboard\n5. Toggle "X / Twitter (OAuth 2.0)" ON\n6. Re-enter Client ID: cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ\n7. Re-enter Client Secret: HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz\n8. Click "Save"\n9. Wait 120 seconds (longer than usual)\n10. Test again\n\n🔍 For detailed diagnostics, visit: ${cleanAppUrl}/api/debug/test-authorize`;
                
                return NextResponse.redirect(
                  new URL(
                    `/auth/login?error=${encodeURIComponent(errorMsg)}`,
                    cleanAppUrl
                  )
                );
              }
            } catch {
              // Not JSON, log the text
              console.error("[OAuth Init] Backend error response:", errorText.substring(0, 200));
            }
          } catch (fetchError: any) {
            console.error("[OAuth Init] Failed to get error details:", fetchError.message);
          }
          
          // Generic error for backend rejection
          const errorMsg = `CRITICAL: Supabase backend rejected the OAuth request (status ${status}).\n\nThis usually means:\n1. Provider is not enabled in backend (UI vs backend mismatch)\n2. Credentials are invalid\n3. Site URL or Redirect URL mismatch\n\n🔴 Visit ${cleanAppUrl}/api/debug/test-authorize for detailed diagnostics`;
          return NextResponse.redirect(
            new URL(
              `/auth/login?error=${encodeURIComponent(errorMsg)}`,
              cleanAppUrl
            )
          );
        } else if (status >= 300 && status < 400) {
          // Redirect means it's working
          const location = testResponse.headers.get("location");
          console.log("[OAuth Init] Authorize URL test passed - redirects to:", location?.substring(0, 100));
        }
        
        console.log("[OAuth Init] OAuth URL validated successfully - backend recognizes provider");
      } catch (testError: any) {
        // If test fails, log but don't block - might be network issue
        console.warn("[OAuth Init] Could not test authorize URL:", testError.message);
        console.log("[OAuth Init] Proceeding with redirect (test failed but URL format is valid)");
      }
    } catch (urlError: any) {
      console.error("[OAuth Init] Invalid OAuth URL returned:", data.url);
      const errorMsg = `CRITICAL: Supabase returned an invalid OAuth URL. This usually means:\n1. Provider credentials are invalid\n2. Provider is not properly enabled\n3. Site URL or Redirect URL mismatch\n\n🔴 FIX: Follow the steps in the error message above.\n🔍 Visit ${cleanAppUrl}/api/debug/test-authorize for diagnostics`;
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(errorMsg)}`,
          cleanAppUrl
        )
      );
    }

    console.log("[OAuth Init] Success! Redirecting to Supabase OAuth URL");
    console.log("[OAuth Init] OAuth URL:", data.url);
    return NextResponse.redirect(data.url);
  } catch (error: any) {
    console.error("[OAuth Init] ===== Unexpected Error =====");
    console.error("[OAuth Init] Error:", error);
    console.error("[OAuth Init] Stack:", error?.stack);
    console.error("[OAuth Init] ==============================");
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(`Unexpected error: ${error?.message || "Unknown error"}. Please check server logs for details.`)}`,
        appUrl
      )
    );
  }
}

