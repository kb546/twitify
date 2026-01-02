import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    // Handle OAuth errors from Supabase/Twitter
    if (error) {
      console.error("[OAuth Callback] OAuth error:", {
        error,
        errorDescription,
        url: requestUrl.toString(),
      });
      
      const errorMessage = errorDescription || error || "OAuth authentication failed";
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(`OAuth Error: ${errorMessage}. Please try again.`)}`,
          appUrl
        )
      );
    }

    if (!code) {
      console.error("[OAuth Callback] No authorization code received");
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent("No authorization code received. Please try signing in again.")}`,
          appUrl
        )
      );
    }

    console.log("[OAuth Callback] Exchanging code for session");
    const supabase = await createClient();
    
    if (!supabase) {
      console.error("[OAuth Callback] Failed to create Supabase client");
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent("Authentication service unavailable. Please check configuration.")}`,
          appUrl
        )
      );
    }

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[OAuth Callback] Session exchange error:", {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
      });
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(`Session Error: ${exchangeError.message}. Please try signing in again.`)}`,
          appUrl
        )
      );
    }

    if (!data?.session) {
      console.error("[OAuth Callback] No session created after code exchange");
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent("Failed to create session. Please try signing in again.")}`,
          appUrl
        )
      );
    }

    console.log("[OAuth Callback] Successfully authenticated user:", data.user?.id);
    return NextResponse.redirect(new URL(next, appUrl));
  } catch (error: any) {
    console.error("[OAuth Callback] Unexpected error:", error);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(`Unexpected error: ${error?.message || "Unknown error"}`)}`,
        appUrl
      )
    );
  }
}

