import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { formatOAuthError, createErrorMessage } from "@/lib/oauth/error-handler";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const step = "callback_processing";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  try {
    console.log("[OAuth Callback] ===== OAuth Callback Processing =====");
    
    // ===== STEP 1: Parse Request URL =====
    let requestUrl: URL;
    try {
      requestUrl = new URL(request.url);
      console.log("[OAuth Callback] Request URL parsed successfully");
      console.log("[OAuth Callback] Full URL:", requestUrl.toString());
    } catch (urlError: any) {
      console.error("[OAuth Callback] Failed to parse request URL:", urlError);
      const error = formatOAuthError(urlError, { step: "url_parsing", appUrl });
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(error))}`,
          appUrl
        )
      );
    }

    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";

    console.log("[OAuth Callback] Code present:", !!code);
    console.log("[OAuth Callback] Error present:", !!error);
    console.log("[OAuth Callback] Error description:", errorDescription);

    // ===== STEP 2: Handle OAuth Errors from Supabase/Twitter =====
    if (error) {
      console.error("[OAuth Callback] OAuth error received from provider:", {
        error,
        errorDescription,
        url: requestUrl.toString(),
      });
      
      const errorMessage = errorDescription || error || "OAuth authentication failed";
      const oauthError = formatOAuthError(
        { message: `OAuth provider error: ${errorMessage}`, status: 400 },
        { step: "oauth_provider_error", appUrl }
      );
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(oauthError))}`,
          appUrl
        )
      );
    }

    // ===== STEP 3: Validate Authorization Code =====
    if (!code) {
      console.error("[OAuth Callback] No authorization code received");
      const noCodeError = formatOAuthError(
        { message: "No authorization code received from OAuth provider" },
        { step: "code_validation", appUrl }
      );
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(noCodeError))}`,
          appUrl
        )
      );
    }

    console.log("[OAuth Callback] Authorization code received (length:", code.length + ")");

    // ===== STEP 4: Create Supabase Client =====
    console.log("[OAuth Callback] Creating Supabase client...");
    let supabase;
    try {
      supabase = await createClient();
      
      if (!supabase) {
        throw new Error("Supabase client is null");
      }
      
      console.log("[OAuth Callback] Supabase client created successfully");
    } catch (clientError: any) {
      console.error("[OAuth Callback] Failed to create Supabase client:", clientError);
      const error = formatOAuthError(clientError, { step: "supabase_client_creation", appUrl });
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(error))}`,
          appUrl
        )
      );
    }

    // ===== STEP 5: Exchange Code for Session =====
    console.log("[OAuth Callback] Exchanging authorization code for session...");
    
    let exchangeResult;
    try {
      exchangeResult = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeResult.error) {
        throw exchangeResult.error;
      }
      
      console.log("[OAuth Callback] Code exchange successful");
    } catch (exchangeError: any) {
      console.error("[OAuth Callback] Session exchange error:", {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
      });
      
      const error = formatOAuthError(exchangeError, {
        step: "session_exchange",
        appUrl,
      });
      
      // Add specific fix steps for common exchange errors
      if (exchangeError.message?.includes("expired") || exchangeError.message?.includes("invalid")) {
        error.fixSteps.unshift("The authorization code may have expired - try signing in again");
      }
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(error))}`,
          appUrl
        )
      );
    }

    const { data } = exchangeResult;

    // ===== STEP 6: Validate Session =====
    if (!data?.session) {
      console.error("[OAuth Callback] No session created after code exchange");
      const noSessionError = formatOAuthError(
        { message: "No session created after code exchange" },
        { step: "session_validation", appUrl }
      );
      
      noSessionError.fixSteps.unshift("Session creation failed - this may indicate a Supabase configuration issue");
      noSessionError.fixSteps.push("Check Supabase Dashboard → Auth → Settings");
      noSessionError.fixSteps.push(`Visit ${appUrl}/api/debug/full-audit for complete diagnostics`);
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(noSessionError))}`,
          appUrl
        )
      );
    }

    // ===== STEP 7: Success =====
    console.log("[OAuth Callback] ✅ Successfully authenticated user:", data.user?.id);
    console.log("[OAuth Callback] Session created, redirecting to:", next);
    
    return NextResponse.redirect(new URL(next, appUrl));
  } catch (error: any) {
    // ===== CATCH ALL: Unexpected Errors =====
    console.error("[OAuth Callback] ===== UNEXPECTED ERROR =====");
    console.error("[OAuth Callback] Error Type:", error?.constructor?.name);
    console.error("[OAuth Callback] Error Message:", error?.message);
    console.error("[OAuth Callback] Error Stack:", error?.stack);
    console.error("[OAuth Callback] =============================");
    
    const unexpectedError = formatOAuthError(error, {
      step: "unexpected_callback_error",
      appUrl,
    });
    
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(createErrorMessage(unexpectedError))}`,
        appUrl
      )
    );
  }
}

