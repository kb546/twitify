import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` 
          : "NOT SET",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
      },
      supabase: {
        clientCreated: false,
        error: null,
      },
      oauth: {
        redirectUrl: null,
        providerTest: null,
      },
      recommendations: [] as string[],
    };

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      diagnostics.recommendations.push("NEXT_PUBLIC_SUPABASE_URL is not set");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      diagnostics.recommendations.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      diagnostics.recommendations.push("NEXT_PUBLIC_APP_URL is not set - OAuth will fail");
    }

    // Try to create Supabase client
    try {
      const supabase = await createClient();
      diagnostics.supabase.clientCreated = !!supabase;
      
      if (supabase) {
        // Calculate redirect URL
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
        const redirectUrl = `${appUrl}/auth/callback`;
        diagnostics.oauth.redirectUrl = redirectUrl;
        
        // Try to test OAuth (this will fail if provider not enabled, but we can catch the error)
        try {
          const testResult = await supabase.auth.signInWithOAuth({
            provider: "twitter",
            options: {
              redirectTo: redirectUrl,
            },
          });
          
          if (testResult.error) {
            diagnostics.oauth.providerTest = {
              success: false,
              error: testResult.error.message,
              status: testResult.error.status,
              name: testResult.error.name,
            };
            
            // Parse error to provide recommendations
            if (testResult.error.message?.includes("provider is not enabled") || 
                testResult.error.message?.includes("Unsupported provider") ||
                testResult.error.status === 400) {
              diagnostics.recommendations.push("🔴 CRITICAL: Twitter provider is not properly enabled");
              diagnostics.recommendations.push("🔴 Action: Go to Supabase → Auth → Providers → X / Twitter (OAuth 2.0)");
              diagnostics.recommendations.push("🔴 Action: Toggle OFF, wait 5s, toggle ON");
              diagnostics.recommendations.push("🔴 Action: DELETE and re-enter Client ID: cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ");
              diagnostics.recommendations.push("🔴 Action: DELETE and re-enter Client Secret: HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz");
              diagnostics.recommendations.push("🔴 Action: Click 'Save', wait 60 seconds, refresh page to verify");
              diagnostics.recommendations.push("🔴 Action: Verify 'Twitter (Deprecated)' is DISABLED");
            }
            if (testResult.error.message?.includes("redirect")) {
              diagnostics.recommendations.push(`🔴 Redirect URL "${redirectUrl}" is not whitelisted`);
              diagnostics.recommendations.push("🔴 Action: Go to Auth → URL Configuration → Add redirect URL");
            }
            if (testResult.error.status === 400 && !testResult.error.message?.includes("provider")) {
              diagnostics.recommendations.push("🔴 Site URL might not be configured");
              diagnostics.recommendations.push(`🔴 Action: Set Site URL to: ${appUrl}`);
            }
          } else if (testResult.data?.url) {
            // Even if we get a URL, we should validate it
            try {
              const urlObj = new URL(testResult.data.url);
              if (urlObj.hostname.includes("supabase.co")) {
                diagnostics.oauth.providerTest = {
                  success: true,
                  message: "OAuth provider is configured correctly",
                  oauthUrl: testResult.data.url.substring(0, 100) + "...",
                };
              } else {
                diagnostics.oauth.providerTest = {
                  success: false,
                  error: "Invalid OAuth URL returned",
                  oauthUrl: testResult.data.url,
                };
                diagnostics.recommendations.push("🔴 Invalid OAuth URL returned - provider may not be properly configured");
              }
            } catch (urlError) {
              diagnostics.oauth.providerTest = {
                success: false,
                error: "Invalid OAuth URL format",
                oauthUrl: testResult.data.url,
              };
              diagnostics.recommendations.push("🔴 Invalid OAuth URL format - check provider configuration");
            }
          } else {
            diagnostics.oauth.providerTest = {
              success: false,
              error: "No OAuth URL returned",
            };
            diagnostics.recommendations.push("🔴 No OAuth URL returned - provider is not enabled or misconfigured");
          }
        } catch (testError: any) {
          diagnostics.oauth.providerTest = {
            success: false,
            error: testError.message,
          };
          diagnostics.recommendations.push("🔴 OAuth test failed: " + testError.message);
        }
      }
    } catch (error: any) {
      diagnostics.supabase.error = error.message;
      diagnostics.recommendations.push("Failed to create Supabase client: " + error.message);
    }

    // Add general recommendations
    if (diagnostics.recommendations.length === 0) {
      diagnostics.recommendations.push("All basic checks passed. If OAuth still fails, check Supabase dashboard for provider configuration.");
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

