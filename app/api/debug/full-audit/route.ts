import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const audit: any = {
    timestamp: new Date().toISOString(),
    status: "checking",
    checks: {
      environment: {},
      supabase: {},
      oauth: {},
      twitter: {},
    },
    errors: [] as string[],
    warnings: [] as string[],
    recommendations: [] as string[],
  };

  try {
    // ===== CHECK 1: Environment Variables =====
    audit.checks.environment = {
      NEXT_PUBLIC_SUPABASE_URL: {
        present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(process.env.NEXT_PUBLIC_SUPABASE_URL.length - 10)}`
          : "NOT SET",
        valid: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co") || false,
        projectMatch: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("cwdfqloiodoburllwpqe") || false,
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 10)}`
          : "NOT SET",
        valid: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("eyJ") || false,
      },
      NEXT_PUBLIC_APP_URL: {
        present: !!process.env.NEXT_PUBLIC_APP_URL,
        value: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
        hasTrailingSlash: process.env.NEXT_PUBLIC_APP_URL?.endsWith("/") || false,
        isProduction: process.env.NEXT_PUBLIC_APP_URL?.includes("twitify.tech") || false,
      },
      TWITTER_CLIENT_ID: {
        present: !!process.env.TWITTER_CLIENT_ID,
        value: process.env.TWITTER_CLIENT_ID
          ? `${process.env.TWITTER_CLIENT_ID.substring(0, 10)}...${process.env.TWITTER_CLIENT_ID.substring(process.env.TWITTER_CLIENT_ID.length - 5)}`
          : "NOT SET",
        note: "Used for direct Twitter API calls, not OAuth",
      },
      TWITTER_CLIENT_SECRET: {
        present: !!process.env.TWITTER_CLIENT_SECRET,
        value: process.env.TWITTER_CLIENT_SECRET ? "***SET***" : "NOT SET",
        note: "Used for direct Twitter API calls, not OAuth",
      },
    };

    // Check for missing env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      audit.errors.push("NEXT_PUBLIC_SUPABASE_URL is not set");
      audit.recommendations.push("Set NEXT_PUBLIC_SUPABASE_URL in Vercel environment variables");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      audit.errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
      audit.recommendations.push("Set NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables");
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      audit.errors.push("NEXT_PUBLIC_APP_URL is not set");
      audit.recommendations.push("Set NEXT_PUBLIC_APP_URL in Vercel environment variables");
    }
    if (process.env.NEXT_PUBLIC_APP_URL?.endsWith("/")) {
      audit.warnings.push("NEXT_PUBLIC_APP_URL has trailing slash - remove it");
      audit.recommendations.push("Remove trailing slash from NEXT_PUBLIC_APP_URL");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("cwdfqloiodoburllwpqe")) {
      audit.warnings.push("Supabase URL doesn't match expected project (cwdfqloiodoburllwpqe)");
      audit.recommendations.push("Verify you're using the correct Supabase project");
    }

    // ===== CHECK 2: Supabase Connection =====
    try {
      const supabase = await createClient();
      audit.checks.supabase.clientCreated = !!supabase;

      if (supabase) {
        // Test connection
        // Note: "Auth session missing" is EXPECTED and NORMAL - we're testing connection, not authenticating
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          const isExpectedError = userError?.message.includes("not authenticated") || 
                                  userError?.message.includes("Auth session missing");
          
          audit.checks.supabase.connectionTest = {
            success: !userError || isExpectedError,
            error: userError?.message || null,
            note: isExpectedError
              ? "Connection OK - 'Auth session missing' is EXPECTED (we're not authenticated, just testing connection)"
              : null,
          };
          
          // "Auth session missing" is not an error - it means connection works but no user is logged in
          if (userError?.message.includes("Auth session missing")) {
            audit.warnings.push("'Auth session missing' is normal - connection test doesn't require authentication");
          }
        } catch (connError: any) {
          // Only report as error if it's NOT "Auth session missing"
          if (!connError.message?.includes("Auth session missing")) {
            audit.checks.supabase.connectionTest = {
              success: false,
              error: connError.message,
            };
            audit.errors.push(`Supabase connection test failed: ${connError.message}`);
          } else {
            audit.checks.supabase.connectionTest = {
              success: true,
              error: connError.message,
              note: "Connection OK - 'Auth session missing' is EXPECTED",
            };
          }
        }
      } else {
        audit.errors.push("Failed to create Supabase client");
      }
    } catch (supabaseError: any) {
      audit.checks.supabase.error = supabaseError.message;
      audit.errors.push(`Supabase client creation failed: ${supabaseError.message}`);
    }

    // ===== CHECK 3: OAuth Configuration =====
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const redirectUrl = `${appUrl}/auth/callback`;

    audit.checks.oauth = {
      appUrl,
      redirectUrl,
      oauthUrlGeneration: null,
      authorizeUrlTest: null,
    };

    try {
      const supabase = await createClient();
      if (supabase) {
        // Test OAuth URL generation
        try {
          console.log("[Full Audit] Testing provider: x (for Twitter OAuth 2.0)");
          const oauthResult = await supabase.auth.signInWithOAuth({
            provider: "x",
            options: {
              redirectTo: redirectUrl,
            },
          });

          if (oauthResult.error) {
            audit.checks.oauth.oauthUrlGeneration = {
              success: false,
              error: oauthResult.error.message,
              status: oauthResult.error.status,
            };
            audit.errors.push(`OAuth URL generation failed: ${oauthResult.error.message}`);

            if (oauthResult.error.message?.includes("provider is not enabled")) {
              audit.recommendations.push("🔴 CRITICAL: Provider not enabled - see provider configuration steps");
            }
          } else if (oauthResult.data?.url) {
            audit.checks.oauth.oauthUrlGeneration = {
              success: true,
              url: oauthResult.data.url.substring(0, 100) + "...",
            };

            // Test the authorize URL
            try {
              const authorizeTest = await fetch(oauthResult.data.url, {
                method: "GET", // Use GET instead of HEAD
                redirect: "manual",
              });

              const status = authorizeTest.status;
              audit.checks.oauth.authorizeUrlTest = {
                status,
                success: status < 400 || status === 405, // Treat 405 as non-critical for diagnostics
              };

              if (status >= 400 && status !== 405) {
                // Get error details
                try {
                  const errorResponse = await fetch(oauthResult.data.url, {
                    method: "GET",
                    redirect: "manual",
                  });
                  const errorText = await errorResponse.text();

                  try {
                    const errorJson = JSON.parse(errorText);
                    audit.checks.oauth.authorizeUrlTest.error = errorJson;

                    if (
                      errorJson.error_code === "validation_failed" ||
                      errorJson.msg?.includes("provider is not enabled")
                    ) {
                      audit.errors.push("🔴 CRITICAL: Backend says provider is not enabled (UI vs backend mismatch)");
                      audit.recommendations.push("🔴 MOST LIKELY CAUSE: Credential typos in Supabase");
                      audit.recommendations.push("🔴 CHECK: Client ID has 'lNMEM' (lowercase l) NOT 'INMEM' (capital I)");
                      audit.recommendations.push("🔴 CHECK: Client Secret has '4OPlS' (number 4, lowercase l) NOT 'OPIS'");
                      audit.recommendations.push("🔴 FIX: Copy-paste exact values from this audit (never type manually)");
                      audit.recommendations.push("🔴 NUCLEAR FIX: Delete all text → Copy-paste correct values → Save → Wait 120s");
                    }
                  } catch {
                    audit.checks.oauth.authorizeUrlTest.errorText = errorText.substring(0, 200);
                  }
                } catch {}
              } else if (status >= 300 && status < 400) {
                const location = authorizeTest.headers.get("location");
                audit.checks.oauth.authorizeUrlTest.redirectsTo = location?.substring(0, 100);
                if (location && (location.includes("twitter.com") || location.includes("x.com"))) {
                  audit.checks.oauth.authorizeUrlTest.working = true;
                }
              }
            } catch (testError: any) {
              audit.checks.oauth.authorizeUrlTest = {
                error: testError.message,
              };
              audit.warnings.push(`Could not test authorize URL: ${testError.message}`);
            }
          } else {
            audit.checks.oauth.oauthUrlGeneration = {
              success: false,
              error: "No OAuth URL returned",
            };
            audit.errors.push("OAuth URL generation returned no URL");
          }
        } catch (oauthError: any) {
          audit.checks.oauth.oauthUrlGeneration = {
            success: false,
            error: oauthError.message,
          };
          audit.errors.push(`OAuth test failed: ${oauthError.message}`);
        }
      }
    } catch (error: any) {
      audit.errors.push(`OAuth check failed: ${error.message}`);
    }

    // ===== CHECK 4: Twitter Credentials Format =====
    audit.checks.twitter = {
      expectedClientId: "cDhaU2UzbXpFWGpybjlNEM4Mno6MTpjaQ",
      expectedClientSecret: "***CHECK_SUPABASE_DASHBOARD***",
      note: "Client Secret should be entered in Supabase Dashboard → Auth → Providers → X / Twitter (OAuth 2.0). Never store secrets in code!",
      callbackUrl: "https://cwdfqloiodoburllwpqe.supabase.co/auth/v1/callback",
      note2: "This callback URL should be configured in Twitter Developer Portal",
      securityWarning: "⚠️ SECURITY: Secrets should NEVER be hardcoded in source code. They should only be in Supabase Dashboard and environment variables.",
      commonTypos: {
        clientId: {
          wrong: "cDhaU2UzbXpFWGpybjINMEM4Mno6MTpjaQ",
          correct: "cDhaU2UzbXpFWGpybjlNEM4Mno6MTpjaQ",
          issue: "Previous expected value had an extra 'M'",
        },
      },
      whereToGet: "Twitter Developer Portal → Your App → Keys and tokens → OAuth 2.0 Client ID and Secret",
      canChange: "YES - Can regenerate in Twitter Developer Portal, but must update in Supabase and Vercel if changed",
      mcpNote: "MCP connection is for Cursor IDE database access - NOT related to OAuth configuration",
    };

    // ===== FINAL STATUS =====
    if (audit.errors.length === 0 && audit.warnings.length === 0) {
      audit.status = "all_checks_passed";
      audit.recommendations.push("✅ All checks passed! OAuth should work correctly.");
    } else if (audit.errors.length > 0) {
      audit.status = "errors_found";
    } else {
      audit.status = "warnings_only";
    }

    return NextResponse.json(audit, { status: 200 });
  } catch (error: any) {
    audit.status = "audit_failed";
    audit.errors.push(`Audit failed: ${error.message}`);
    return NextResponse.json(audit, { status: 500 });
  }
}

