import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      providerTests: [] as any[],
      recommendations: [] as string[],
    };

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const redirectUrl = `${appUrl}/auth/callback`;

    // Test multiple provider name variations
    const providerNames = ["twitter", "x", "twitter-oauth2"];

    for (const providerName of providerNames) {
      try {
        const supabase = await createClient();
        const oauthResult = await supabase.auth.signInWithOAuth({
          provider: providerName as any,
          options: {
            redirectTo: redirectUrl,
          },
        });

        const testResult: any = {
          providerName,
          urlGenerated: !!oauthResult.data?.url,
          hasError: !!oauthResult.error,
          error: oauthResult.error ? {
            message: oauthResult.error.message,
            status: oauthResult.error.status,
            name: oauthResult.error.name,
          } : null,
        };

        // If URL was generated, test it
        if (oauthResult.data?.url) {
          testResult.oauthUrl = oauthResult.data.url.substring(0, 100) + "...";
          
          try {
            const authorizeTest = await fetch(oauthResult.data.url, {
              method: "HEAD",
              redirect: "manual",
            });

            const status = authorizeTest.status;
            testResult.authorizeTest = {
              status,
              success: status < 400,
            };

            if (status >= 400) {
              // Get error details
              try {
                const errorResponse = await fetch(oauthResult.data.url, {
                  method: "GET",
                  redirect: "manual",
                });
                const errorText = await errorResponse.text();
                
                try {
                  const errorJson = JSON.parse(errorText);
                  testResult.authorizeTest.error = errorJson;
                  
                  if (errorJson.msg?.includes("provider is not enabled")) {
                    testResult.authorizeTest.providerNotEnabled = true;
                  }
                } catch {
                  testResult.authorizeTest.errorText = errorText.substring(0, 200);
                }
              } catch {}
            } else if (status >= 300 && status < 400) {
              const location = authorizeTest.headers.get("location");
              testResult.authorizeTest.redirectsTo = location?.substring(0, 100);
              if (location && (location.includes("twitter.com") || location.includes("x.com"))) {
                testResult.authorizeTest.working = true;
              }
            }
          } catch (testError: any) {
            testResult.authorizeTest = {
              error: testError.message,
            };
          }
        }

        results.providerTests.push(testResult);
      } catch (error: any) {
        results.providerTests.push({
          providerName,
          error: error.message,
        });
      }
    }

    // Analyze results
    const workingProvider = results.providerTests.find((test: any) => 
      test.authorizeTest?.working || (test.authorizeTest?.success && test.authorizeTest.status < 400)
    );

    if (workingProvider) {
      results.recommendations.push(`✅ Provider "${workingProvider.providerName}" is working!`);
      results.recommendations.push(`Use provider name: "${workingProvider.providerName}"`);
    } else {
      const urlGenerated = results.providerTests.find((test: any) => test.urlGenerated);
      const providerNotEnabled = results.providerTests.find((test: any) => 
        test.authorizeTest?.providerNotEnabled
      );

      if (providerNotEnabled) {
        results.recommendations.push("🔴 CRITICAL: Backend says provider is not enabled");
        results.recommendations.push("🔴 This confirms UI vs backend mismatch");
        results.recommendations.push("🔴 NUCLEAR FIX REQUIRED:");
        results.recommendations.push("1. Disable provider in Supabase");
        results.recommendations.push("2. Wait 60 seconds");
        results.recommendations.push("3. Clear browser cache");
        results.recommendations.push("4. Re-enable provider");
        results.recommendations.push("5. Re-enter credentials");
        results.recommendations.push("6. Save and wait 120 seconds");
      } else if (urlGenerated) {
        results.recommendations.push("⚠️ OAuth URL generated but backend test failed");
        results.recommendations.push("Visit /api/debug/test-authorize for detailed test");
      } else {
        results.recommendations.push("🔴 No provider name worked");
        results.recommendations.push("Check Supabase dashboard - provider may not be enabled");
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Provider check failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

