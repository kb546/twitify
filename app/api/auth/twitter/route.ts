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

    const supabase = await createClient();
    
    if (!supabase) {
      console.error("[OAuth Init] Failed to create Supabase client");
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent("Authentication service unavailable. Please check Supabase configuration.")}`,
          cleanAppUrl
        )
      );
    }

    // This route initiates Twitter OAuth - users don't need to be authenticated yet
    console.log("[OAuth Init] Calling Supabase signInWithOAuth with redirectTo:", redirectTo);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("[OAuth Init] ===== Supabase OAuth Error =====");
      console.error("[OAuth Init] Error Message:", error.message);
      console.error("[OAuth Init] Error Status:", error.status);
      console.error("[OAuth Init] Error Name:", error.name);
      console.error("[OAuth Init] Redirect URL Used:", redirectTo);
      console.error("[OAuth Init] =================================");
      
      // Provide specific error messages based on error type
      let errorMessage = error.message;
      if (error.message.includes("provider is not enabled") || error.status === 400) {
        errorMessage = `Twitter provider is not enabled or redirect URL "${redirectTo}" is not whitelisted in Supabase. Please check: 1) "X / Twitter (OAuth 2.0)" is enabled (not deprecated), 2) Redirect URL "${redirectTo}" is added to allowed redirect URLs in Supabase Auth settings.`;
      } else if (error.message.includes("redirect")) {
        errorMessage = `Redirect URL error: "${redirectTo}" - Make sure this URL is added to Supabase redirect URLs whitelist.`;
      }
      
      // Redirect to login page with detailed error message
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(`OAuth Error: ${errorMessage}`)}`,
          cleanAppUrl
        )
      );
    }

    if (!data?.url) {
      console.error("[OAuth Init] No OAuth URL returned from Supabase");
      console.error("[OAuth Init] This usually means:");
      console.error("[OAuth Init] 1. Twitter provider is not enabled in Supabase");
      console.error("[OAuth Init] 2. Wrong provider is enabled (deprecated instead of OAuth 2.0)");
      console.error("[OAuth Init] 3. Redirect URL is not whitelisted:", redirectTo);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(`Failed to generate OAuth URL. Please verify: 1) "X / Twitter (OAuth 2.0)" is enabled in Supabase, 2) Redirect URL "${redirectTo}" is added to allowed redirect URLs.`)}`,
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

