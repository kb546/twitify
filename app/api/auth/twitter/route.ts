import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cleanAppUrl = appUrl.replace(/\/$/, ""); // Remove trailing slash
    
    console.log("[OAuth Init] App URL:", cleanAppUrl);
    console.log("[OAuth Init] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    const supabase = await createClient();
    
    if (!supabase) {
      console.error("[OAuth Init] Failed to create Supabase client");
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent("Authentication service unavailable. Please check configuration.")}`, cleanAppUrl)
      );
    }

    // This route initiates Twitter OAuth - users don't need to be authenticated yet
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: `${cleanAppUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("[OAuth Init] Supabase OAuth error:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      // Redirect to login page with error message
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(`OAuth Error: ${error.message}. Please check Supabase Twitter provider configuration.`)}`,
          cleanAppUrl
        )
      );
    }

    if (!data?.url) {
      console.error("[OAuth Init] No OAuth URL returned from Supabase");
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent("Failed to generate OAuth URL. Please verify Twitter provider is enabled in Supabase.")}`,
          cleanAppUrl
        )
      );
    }

    console.log("[OAuth Init] Redirecting to:", data.url);
    return NextResponse.redirect(data.url);
  } catch (error: any) {
    console.error("[OAuth Init] Unexpected error:", error);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(`Unexpected error: ${error?.message || "Unknown error"}`)}`,
        appUrl
      )
    );
  }
}

