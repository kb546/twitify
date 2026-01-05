import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      testResults: {
        oauthUrlGeneration: null,
        authorizeUrlTest: null,
        providerStatus: null,
      },
      recommendations: [] as string[],
    };

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const redirectUrl = `${appUrl}/auth/callback`;

    // Step 1: Generate OAuth URL
    try {
      const supabase = await createClient();
      console.log("[Test Authorize] Testing provider: x");
      const oauthResult = await supabase.auth.signInWithOAuth({
        provider: "x",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthResult.error) {
        diagnostics.testResults.oauthUrlGeneration = {
          success: false,
          error: oauthResult.error.message,
          status: oauthResult.error.status,
        };
        diagnostics.recommendations.push("Failed to generate OAuth URL: " + oauthResult.error.message);
        return NextResponse.json(diagnostics, { status: 200 });
      }

      if (!oauthResult.data?.url) {
        diagnostics.testResults.oauthUrlGeneration = {
          success: false,
          error: "No OAuth URL returned",
        };
        diagnostics.recommendations.push("No OAuth URL returned from signInWithOAuth");
        return NextResponse.json(diagnostics, { status: 200 });
      }

      const oauthUrl = oauthResult.data.url;
      diagnostics.testResults.oauthUrlGeneration = {
        success: true,
        url: oauthUrl.substring(0, 150) + "...",
      };

      // Step 2: Test the authorize URL directly
      try {
        // Parse the URL to extract the authorize endpoint
        const urlObj = new URL(oauthUrl);
        const providerParam = urlObj.searchParams.get("provider");
        const redirectToParam = urlObj.searchParams.get("redirect_to");

        diagnostics.testResults.providerStatus = {
          providerParam,
          redirectToParam,
          authorizePath: urlObj.pathname,
        };

        // Make a HEAD request to test the authorize endpoint
        // We use HEAD to avoid following redirects, just check if endpoint accepts the request
        const testResponse = await fetch(oauthUrl, {
          method: "HEAD",
          redirect: "manual", // Don't follow redirects
          headers: {
            "User-Agent": "Twitify-Debug/1.0",
          },
        });

        const status = testResponse.status;
        const location = testResponse.headers.get("location");

        diagnostics.testResults.authorizeUrlTest = {
          success: status < 400,
          status,
          location: location ? location.substring(0, 100) + "..." : null,
          headers: {
            contentType: testResponse.headers.get("content-type"),
            xError: testResponse.headers.get("x-error"),
          },
        };

        // Parse response if it's an error
        if (status >= 400) {
          // Try to get error details from response body
          try {
            const errorResponse = await fetch(oauthUrl, {
              method: "GET",
              redirect: "manual",
            });
            const errorText = await errorResponse.text();
            
            // Try to parse as JSON
            try {
              const errorJson = JSON.parse(errorText);
              diagnostics.testResults.authorizeUrlTest.errorDetails = errorJson;
              
              if (errorJson.error_code === "validation_failed" || errorJson.msg?.includes("provider is not enabled")) {
                diagnostics.recommendations.push("🔴 CRITICAL: Supabase backend says provider is not enabled");
                diagnostics.recommendations.push("🔴 This means UI shows enabled but backend doesn't recognize it");
                diagnostics.recommendations.push("🔴 NUCLEAR FIX REQUIRED:");
                diagnostics.recommendations.push("1. Go to Supabase → Auth → Providers");
                diagnostics.recommendations.push("2. Toggle 'X / Twitter (OAuth 2.0)' OFF");
                diagnostics.recommendations.push("3. Wait 60 seconds");
                diagnostics.recommendations.push("4. Clear browser cache for Supabase dashboard");
                diagnostics.recommendations.push("5. Toggle 'X / Twitter (OAuth 2.0)' ON");
                diagnostics.recommendations.push("6. Re-enter Client ID: cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ");
                diagnostics.recommendations.push("7. Re-enter Client Secret: HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz");
                diagnostics.recommendations.push("8. Click Save");
                diagnostics.recommendations.push("9. Wait 120 seconds (longer than usual)");
                diagnostics.recommendations.push("10. Test again using this endpoint");
              }
            } catch {
              diagnostics.testResults.authorizeUrlTest.errorText = errorText.substring(0, 500);
            }
          } catch (fetchError: any) {
            diagnostics.testResults.authorizeUrlTest.fetchError = fetchError.message;
          }
        } else if (status >= 300 && status < 400 && location) {
          // Redirect means it's working - check if redirecting to Twitter
          if (location.includes("twitter.com") || location.includes("x.com")) {
            diagnostics.testResults.authorizeUrlTest.success = true;
            diagnostics.recommendations.push("✅ Authorize URL is working - redirects to Twitter");
          } else {
            diagnostics.recommendations.push("⚠️ Authorize URL redirects but not to Twitter: " + location.substring(0, 100));
          }
        }
      } catch (testError: any) {
        diagnostics.testResults.authorizeUrlTest = {
          success: false,
          error: testError.message,
        };
        diagnostics.recommendations.push("Failed to test authorize URL: " + testError.message);
      }
    } catch (error: any) {
      diagnostics.testResults.oauthUrlGeneration = {
        success: false,
        error: error.message,
      };
      diagnostics.recommendations.push("Failed to create Supabase client: " + error.message);
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Test failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

