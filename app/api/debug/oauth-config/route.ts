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
            if (testResult.error.message?.includes("provider is not enabled")) {
              diagnostics.recommendations.push("Twitter provider is not enabled in Supabase");
              diagnostics.recommendations.push("Check: Auth → Providers → X / Twitter (OAuth 2.0) is enabled");
              diagnostics.recommendations.push("Verify Client ID and Secret are saved (not just filled, but saved)");
            }
            if (testResult.error.message?.includes("redirect")) {
              diagnostics.recommendations.push(`Redirect URL "${redirectUrl}" is not whitelisted in Supabase`);
              diagnostics.recommendations.push("Check: Auth → URL Configuration → Redirect URLs");
            }
            if (testResult.error.status === 400) {
              diagnostics.recommendations.push("Site URL might not be configured in Supabase");
              diagnostics.recommendations.push("Check: Auth → URL Configuration → Site URL should be: " + appUrl);
            }
          } else if (testResult.data?.url) {
            diagnostics.oauth.providerTest = {
              success: true,
              message: "OAuth provider is configured correctly",
            };
          }
        } catch (testError: any) {
          diagnostics.oauth.providerTest = {
            success: false,
            error: testError.message,
          };
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

