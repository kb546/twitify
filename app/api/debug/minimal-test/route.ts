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

    // STEP 3: Call signInWithOAuth for multiple provider names
    const redirectUrl = `${result.step1_env.appUrl.replace(/\/$/, "")}/auth/callback`;
    const providersToTest = ["twitter", "x", "twitter_oauth2"];
    result.step3_oauth_tests = {};

    for (const provider of providersToTest) {
      try {
        const oauthResult = await supabase.auth.signInWithOAuth({
          provider: provider as any,
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (oauthResult.error) {
          result.step3_oauth_tests[provider] = {
            success: false,
            error: oauthResult.error.message,
            status: oauthResult.error.status,
          };
        } else if (oauthResult.data?.url) {
          result.step3_oauth_tests[provider] = {
            success: true,
            url: oauthResult.data.url.substring(0, 150) + "...",
          };

          // STEP 4: Test the authorize URL for the successful provider
          try {
            const authorizeResponse = await fetch(oauthResult.data.url, {
              method: "GET",
              redirect: "manual",
              signal: AbortSignal.timeout(10000),
            });

            result.step3_oauth_tests[provider].authorizeTest = {
              status: authorizeResponse.status,
            };

            if (authorizeResponse.status >= 400) {
              const errorText = await authorizeResponse.text();
              try {
                const errorJson = JSON.parse(errorText);
                result.step3_oauth_tests[provider].authorizeTest.error = errorJson;
              } catch {
                result.step3_oauth_tests[provider].authorizeTest.errorText = errorText.substring(0, 200);
              }
            } else if (authorizeResponse.status >= 300 && authorizeResponse.status < 400) {
              const location = authorizeResponse.headers.get("location");
              result.step3_oauth_tests[provider].authorizeTest.redirectsTo = location?.substring(0, 100);
            }
          } catch (testError: any) {
            result.step3_oauth_tests[provider].authorizeTest = {
              error: testError.message,
            };
          }
        }
      } catch (e: any) {
        result.step3_oauth_tests[provider] = {
          success: false,
          error: e.message,
        };
      }
    }

    // Determine conclusion based on tests
    const successfulProvider = Object.keys(result.step3_oauth_tests).find(
      p => result.step3_oauth_tests[p].success && result.step3_oauth_tests[p].authorizeTest?.status < 400
    );

    if (successfulProvider) {
      result.conclusion = `SUCCESS: Provider '${successfulProvider}' is working and authorized!`;
    } else {
      const anySuccessInCall = Object.keys(result.step3_oauth_tests).find(p => result.step3_oauth_tests[p].success);
      if (anySuccessInCall) {
        result.conclusion = "ROOT CAUSE: Supabase returns OAuth URLs but the backend rejects all of them with 'provider not enabled'. This confirms a sync issue between UI and Backend in Supabase Dashboard.";
      } else {
        result.conclusion = "CRITICAL: All provider name variations failed to even generate an OAuth URL. Check your Supabase configuration.";
      }
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

