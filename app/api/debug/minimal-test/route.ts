import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * Minimal OAuth Test - Tests ONLY the core OAuth flow
 * No extra checks, no complex logic - just the basics
 */
export async function GET(request: NextRequest) {
  const result: any = {
    timestamp: new Date().toISOString(),
    step1_env: null,
    step2_supabase_client: null,
    step3_oauth_call: null,
    step4_authorize_test: null,
    conclusion: null,
  };

  try {
    // STEP 1: Environment Variables
    result.step1_env = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 50) + "..."
        : "NOT SET",
    };

    if (!result.step1_env.hasSupabaseUrl || !result.step1_env.hasSupabaseKey || !result.step1_env.hasAppUrl) {
      result.conclusion = "Environment variables missing";
      return NextResponse.json(result, { status: 200 });
    }

    // STEP 2: Create Supabase Client
    try {
      const supabase = await createClient();
      result.step2_supabase_client = {
        success: !!supabase,
        error: null,
      };

      if (!supabase) {
        result.conclusion = "Failed to create Supabase client";
        return NextResponse.json(result, { status: 200 });
      }

      // STEP 3: Call signInWithOAuth
      const redirectUrl = `${result.step1_env.appUrl.replace(/\/$/, "")}/auth/callback`;
      
      result.step3_oauth_call = {
        redirectUrl,
        provider: "twitter",
      };

      const oauthResult = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthResult.error) {
        result.step3_oauth_call.error = {
          message: oauthResult.error.message,
          status: oauthResult.error.status,
          name: oauthResult.error.name,
        };
        result.conclusion = `OAuth call failed: ${oauthResult.error.message}`;
        return NextResponse.json(result, { status: 200 });
      }

      if (!oauthResult.data?.url) {
        result.step3_oauth_call.error = "No URL returned";
        result.conclusion = "OAuth call succeeded but no URL returned";
        return NextResponse.json(result, { status: 200 });
      }

      result.step3_oauth_call.success = true;
      result.step3_oauth_call.url = oauthResult.data.url.substring(0, 200) + "...";

      // STEP 4: Test the authorize URL
      try {
        const authorizeResponse = await fetch(oauthResult.data.url, {
          method: "GET",
          redirect: "manual",
          signal: AbortSignal.timeout(10000),
        });

        result.step4_authorize_test = {
          status: authorizeResponse.status,
          headers: {
            location: authorizeResponse.headers.get("location")?.substring(0, 100),
            contentType: authorizeResponse.headers.get("content-type"),
          },
        };

        if (authorizeResponse.status >= 400) {
          const errorText = await authorizeResponse.text();
          try {
            const errorJson = JSON.parse(errorText);
            result.step4_authorize_test.error = errorJson;
            
            if (errorJson.msg?.includes("provider is not enabled")) {
              result.conclusion = "ROOT CAUSE: Supabase backend says provider is not enabled. This means credentials in Supabase Dashboard are incorrect or provider configuration is not synced to backend.";
            } else {
              result.conclusion = `Authorize endpoint returned error: ${errorJson.msg || errorJson.error_code}`;
            }
          } catch {
            result.step4_authorize_test.errorText = errorText.substring(0, 300);
            result.conclusion = `Authorize endpoint returned error (status ${authorizeResponse.status})`;
          }
        } else if (authorizeResponse.status >= 300 && authorizeResponse.status < 400) {
          const location = authorizeResponse.headers.get("location");
          if (location && (location.includes("twitter.com") || location.includes("x.com"))) {
            result.conclusion = "SUCCESS: OAuth is working correctly - redirects to Twitter";
          } else {
            result.conclusion = `Authorize redirects but not to Twitter: ${location?.substring(0, 100)}`;
          }
        } else {
          result.conclusion = `Authorize returned status ${authorizeResponse.status} (unexpected)`;
        }
      } catch (testError: any) {
        result.step4_authorize_test = {
          error: testError.message,
        };
        result.conclusion = `Failed to test authorize URL: ${testError.message}`;
      }

    } catch (clientError: any) {
      result.step2_supabase_client = {
        success: false,
        error: clientError.message,
      };
      result.conclusion = `Supabase client error: ${clientError.message}`;
    }

  } catch (error: any) {
    result.error = error.message;
    result.conclusion = `Unexpected error: ${error.message}`;
  }

  return NextResponse.json(result, { status: 200 });
}

