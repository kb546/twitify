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
    // Try "twitter" first, then fallback to "x" if it fails (for OAuth 2.0)
    console.log("[OAuth Init] Calling Supabase signInWithOAuth with redirectTo:", redirectTo);
    
    let providerName: "twitter" | "x" = "twitter";
    let data: any = null;
    let error: any = null;
    
    // Try with "twitter" provider first
    const result = await supabase.auth.signInWithOAuth({
      provider: providerName,
      options: {
        redirectTo,
      },
    });
    
    data = result.data;
    error = result.error;
    
    // If "twitter" fails with provider error, try "x" (OAuth 2.0 might use different name)
    if (error && (error.message?.includes("provider") || error.status === 400)) {
      console.warn("[OAuth Init] Provider 'twitter' failed, trying 'x' instead");
      providerName = "x";
      
      const retryResult = await supabase.auth.signInWithOAuth({
        provider: providerName,
        options: {
          redirectTo,
        },
      });
      
      data = retryResult.data;
      error = retryResult.error;
      
      if (!error) {
        console.log("[OAuth Init] Success with provider 'x'");
      }
    }

    if (error) {
      console.error("[OAuth Init] ===== Supabase OAuth Error =====");
      console.error("[OAuth Init] Provider Tried:", providerName);
      console.error("[OAuth Init] Error Message:", error.message);
      console.error("[OAuth Init] Error Status:", error.status);
      console.error("[OAuth Init] Error Name:", error.name);
      console.error("[OAuth Init] Error Object:", JSON.stringify(error, null, 2));
      console.error("[OAuth Init] Redirect URL Used:", redirectTo);
      console.error("[OAuth Init] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50));
      console.error("[OAuth Init] =================================");
      
      // Categorize error type
      let errorCategory = "unknown";
      let errorMessage = error.message || "Unknown error";
      const fixSteps: string[] = [];
      
      if (error.message?.includes("provider is not enabled") || 
          error.message?.includes("Unsupported provider") ||
          (error.status === 400 && error.message?.includes("provider"))) {
        errorCategory = "provider_not_enabled";
        errorMessage = `Twitter provider is not enabled in Supabase.`;
        fixSteps.push(`1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers`);
        fixSteps.push(`2. Click "X / Twitter (OAuth 2.0)" (NOT "Twitter (Deprecated)")`);
        fixSteps.push(`3. Toggle it ON (should show green "Enabled")`);
        fixSteps.push(`4. Enter Client ID: cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ`);
        fixSteps.push(`5. Enter Client Secret: HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz`);
        fixSteps.push(`6. Click "Save" and wait 60 seconds`);
        fixSteps.push(`7. Make sure "Twitter (Deprecated)" is DISABLED`);
      } else if (error.message?.includes("redirect") || error.status === 400) {
        errorCategory = "redirect_url_error";
        errorMessage = `Redirect URL "${redirectTo}" is not whitelisted or Site URL not configured.`;
        fixSteps.push(`1. Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/url-configuration`);
        fixSteps.push(`2. Set Site URL to: ${cleanAppUrl}`);
        fixSteps.push(`3. Add Redirect URL: ${redirectTo}`);
        fixSteps.push(`4. Click "Save" and wait 60 seconds`);
      } else if (error.status === 400) {
        errorCategory = "configuration_error";
        errorMessage = `OAuth configuration error (HTTP 400).`;
        fixSteps.push(`1. Check diagnostic endpoint: ${cleanAppUrl}/api/debug/oauth-config`);
        fixSteps.push(`2. Verify "X / Twitter (OAuth 2.0)" is enabled in Supabase`);
        fixSteps.push(`3. Verify Site URL is set to: ${cleanAppUrl}`);
        fixSteps.push(`4. Verify Redirect URL "${redirectTo}" is whitelisted`);
      }
      
      const fullErrorMessage = `${errorMessage}\n\nFix Steps:\n${fixSteps.join('\n')}\n\nFor diagnostics, visit: ${cleanAppUrl}/api/debug/oauth-config`;
      
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
      console.error("[OAuth Init] Provider Used:", providerName);
      console.error("[OAuth Init] Redirect URL:", redirectTo);
      console.error("[OAuth Init] This usually means:");
      console.error("[OAuth Init] 1. Twitter provider is not enabled in Supabase");
      console.error("[OAuth Init] 2. Wrong provider is enabled (deprecated instead of OAuth 2.0)");
      console.error("[OAuth Init] 3. Redirect URL is not whitelisted:", redirectTo);
      console.error("[OAuth Init] 4. Site URL is not configured in Supabase");
      console.error("[OAuth Init] 5. Provider name mismatch (tried:", providerName, ")");
      
      const errorMsg = `Failed to generate OAuth URL. Please verify: 1) "X / Twitter (OAuth 2.0)" is enabled in Supabase (not deprecated), 2) Redirect URL "${redirectTo}" is added to allowed redirect URLs, 3) Site URL is configured in Supabase (Auth → URL Configuration → Site URL should be "${cleanAppUrl}").`;
      
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

