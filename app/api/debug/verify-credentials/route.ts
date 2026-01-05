import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * This endpoint helps verify if Supabase is actually using the credentials
 * by attempting OAuth and checking what error (if any) we get
 */
export async function GET(request: NextRequest) {
  try {
    const verification: any = {
      timestamp: new Date().toISOString(),
      credentials: {
        expectedClientId: "cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ",
        expectedClientSecret: "***CHECK_SUPABASE_DASHBOARD***",
        note: "Client Secret should be entered in Supabase Dashboard → Auth → Providers → X / Twitter (OAuth 2.0). Never store secrets in code!",
        securityNote: "Secrets should NEVER be hardcoded in source code. They should only be in Supabase Dashboard and environment variables.",
      },
      tests: {
        oauthUrlGeneration: null,
        authorizeUrlTest: null,
      },
      findings: [] as string[],
      recommendations: [] as string[],
    };

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const redirectUrl = `${appUrl}/auth/callback`;

    try {
      const supabase = await createClient();
      
      // Test 1: Can we generate OAuth URL?
      try {
        const oauthResult = await supabase.auth.signInWithOAuth({
          provider: "x",
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (oauthResult.error) {
          verification.tests.oauthUrlGeneration = {
            success: false,
            error: oauthResult.error.message,
            status: oauthResult.error.status,
          };
          verification.findings.push(`OAuth URL generation failed: ${oauthResult.error.message}`);
          
          if (oauthResult.error.message?.includes("provider is not enabled")) {
            verification.recommendations.push("🔴 Provider not enabled in Supabase backend");
            verification.recommendations.push("🔴 Action: Toggle provider OFF → Wait 60s → Toggle ON → Re-enter credentials → Save → Wait 120s");
          }
        } else if (oauthResult.data?.url) {
          verification.tests.oauthUrlGeneration = {
            success: true,
            url: oauthResult.data.url.substring(0, 150) + "...",
          };

          // Test 2: Does the authorize URL work?
          try {
            const authorizeTest = await fetch(oauthResult.data.url, {
              method: "HEAD",
              redirect: "manual",
              signal: AbortSignal.timeout(10000),
            });

            const status = authorizeTest.status;
            verification.tests.authorizeUrlTest = {
              status,
              success: status < 400,
            };

            if (status >= 400) {
              // Get error details
              try {
                const errorResponse = await fetch(oauthResult.data.url, {
                  method: "GET",
                  redirect: "manual",
                  signal: AbortSignal.timeout(10000),
                });
                const errorText = await errorResponse.text();
                
                try {
                  const errorJson = JSON.parse(errorText);
                  verification.tests.authorizeUrlTest.error = errorJson;
                  
                  if (
                    errorJson.error_code === "validation_failed" ||
                    errorJson.msg?.includes("provider is not enabled")
                  ) {
                    verification.findings.push("🔴 CRITICAL: Backend says provider is not enabled");
                    verification.recommendations.push("🔴 This means credentials in Supabase are incorrect or not saved");
                    verification.recommendations.push("🔴 Verify in Supabase: Client ID = cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ");
                    verification.recommendations.push("🔴 Verify in Supabase: Client Secret matches what's in Twitter Developer Portal");
                    verification.recommendations.push("🔴 After updating, wait 120 seconds before testing");
                  } else {
                    verification.findings.push(`Backend error: ${errorJson.msg || errorJson.error_code}`);
                  }
                } catch {
                  verification.tests.authorizeUrlTest.errorText = errorText.substring(0, 200);
                }
              } catch {}
            } else if (status >= 300 && status < 400) {
              const location = authorizeTest.headers.get("location");
              verification.tests.authorizeUrlTest.redirectsTo = location?.substring(0, 100);
              if (location && (location.includes("twitter.com") || location.includes("x.com"))) {
                verification.findings.push("✅ OAuth is working correctly - redirects to Twitter");
              }
            }
          } catch (testError: any) {
            verification.tests.authorizeUrlTest = {
              error: testError.message,
            };
            verification.findings.push(`Could not test authorize URL: ${testError.message}`);
          }
        } else {
          verification.tests.oauthUrlGeneration = {
            success: false,
            error: "No OAuth URL returned",
          };
          verification.findings.push("No OAuth URL returned from Supabase");
        }
      } catch (oauthError: any) {
        verification.tests.oauthUrlGeneration = {
          success: false,
          error: oauthError.message,
        };
        verification.findings.push(`OAuth test failed: ${oauthError.message}`);
      }
    } catch (error: any) {
      verification.findings.push(`Failed to create Supabase client: ${error.message}`);
    }

    // Summary
    if (verification.findings.some((f: string) => f.includes("✅"))) {
      verification.status = "working";
    } else if (verification.findings.some((f: string) => f.includes("🔴"))) {
      verification.status = "critical_issue";
    } else {
      verification.status = "needs_investigation";
    }

    return NextResponse.json(verification, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Verification failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

