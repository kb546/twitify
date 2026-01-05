import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatOAuthError, createErrorMessage } from "@/lib/oauth/error-handler";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const step = "initialization";
  let cleanAppUrl = "http://localhost:3000";
  let redirectTo = "";

  try {
    // ===== STEP 1: Validate and Setup Environment =====
    console.log("[OAuth Init] ===== STEP 1: Environment Setup =====");
    
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      cleanAppUrl = appUrl.replace(/\/$/, ""); // Remove trailing slash
      redirectTo = `${cleanAppUrl}/auth/callback`;
      
      console.log("[OAuth Init] App URL (from env):", cleanAppUrl);
      console.log("[OAuth Init] Redirect URL:", redirectTo);
      console.log("[OAuth Init] Supabase URL configured:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("[OAuth Init] Supabase Anon Key configured:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      // Validate NEXT_PUBLIC_APP_URL is set (critical for production)
      if (!process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === "production") {
        const error = formatOAuthError(
          { message: "NEXT_PUBLIC_APP_URL not set in production" },
          { step: "environment_setup", appUrl: cleanAppUrl }
        );
        console.error("[OAuth Init] ERROR:", error.message);
        return NextResponse.redirect(
          new URL(
            `/auth/login?error=${encodeURIComponent(createErrorMessage(error))}`,
            cleanAppUrl
          )
        );
      }
    } catch (envError: any) {
      const error = formatOAuthError(envError, { step: "environment_setup", appUrl: cleanAppUrl });
      console.error("[OAuth Init] Environment setup error:", envError);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(error))}`,
          cleanAppUrl
        )
      );
    }

    // Detect if accessed via preview domain
    const requestOrigin = request.headers.get("origin") || request.headers.get("referer") || "";
    const isPreviewDomain = requestOrigin.includes("vercel.app") && !requestOrigin.includes("twitify.tech");
    
    if (isPreviewDomain) {
      console.warn("[OAuth Init] WARNING: Accessed via preview domain. OAuth will redirect to production domain:", cleanAppUrl);
    }

    if (isPreviewDomain) {
      console.warn("[OAuth Init] WARNING: Accessed via preview domain. OAuth will redirect to production domain:", cleanAppUrl);
    }

    // ===== STEP 2: Verify Supabase Configuration =====
    console.log("[OAuth Init] ===== STEP 2: Supabase Configuration Check =====");
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes("cwdfqloiodoburllwpqe")) {
      console.warn("[OAuth Init] WARNING: Supabase URL might be for different project!");
      console.warn("[OAuth Init] Expected project ref: cwdfqloiodoburllwpqe");
      console.warn("[OAuth Init] Actual URL:", supabaseUrl.substring(0, 50) + "...");
    }

    // ===== STEP 3: Create Supabase Client =====
    console.log("[OAuth Init] ===== STEP 3: Creating Supabase Client =====");
    
    let supabase;
    try {
      supabase = await createClient();
      
      if (!supabase) {
        throw new Error("Supabase client is null");
      }
      
      console.log("[OAuth Init] Supabase client created successfully");
    } catch (clientError: any) {
      const error = formatOAuthError(clientError, {
        step: "supabase_client_creation",
        appUrl: cleanAppUrl,
        supabaseUrl: supabaseUrl,
      });
      console.error("[OAuth Init] Failed to create Supabase client:", clientError);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(error))}`,
          cleanAppUrl
        )
      );
    }

    // Test Supabase connection
    try {
      console.log("[OAuth Init] Testing Supabase connection...");
      const { error: testError } = await supabase.auth.getUser();
      if (testError && !testError.message.includes("not authenticated")) {
        console.warn("[OAuth Init] Supabase connection test warning:", testError.message);
      } else {
        console.log("[OAuth Init] Supabase connection test passed");
      }
    } catch (testErr: any) {
      console.warn("[OAuth Init] Supabase connection test failed (non-critical):", testErr.message);
    }

    // ===== STEP 4: Generate OAuth URL =====
    console.log("[OAuth Init] ===== STEP 4: Generating OAuth URL =====");
    console.log("[OAuth Init] Provider: x (OAuth 2.0)");
    console.log("[OAuth Init] Redirect URL:", redirectTo);
    
    let oauthResult;
    try {
      // BREAKTHROUGH: For the new X / Twitter (OAuth 2.0) provider, 
      // Supabase requires "x" as the provider name, NOT "twitter".
      oauthResult = await supabase.auth.signInWithOAuth({
        provider: "x",
        options: {
          redirectTo,
          queryParams: {
            response_type: "code",
          },
        },
      });
      
      console.log("[OAuth Init] OAuth call completed");
      console.log("[OAuth Init] Has error:", !!oauthResult.error);
      console.log("[OAuth Init] Has URL:", !!oauthResult.data?.url);
    } catch (oauthCallError: any) {
      const error = formatOAuthError(oauthCallError, {
        step: "oauth_url_generation",
        appUrl: cleanAppUrl,
        redirectUrl: redirectTo,
        supabaseUrl: supabaseUrl,
      });
      console.error("[OAuth Init] OAuth call failed:", oauthCallError);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(error))}`,
          cleanAppUrl
        )
      );
    }
    
    const data = oauthResult.data;
    const error = oauthResult.error;

    // ===== STEP 5: Handle OAuth Errors =====
    if (error) {
      console.error("[OAuth Init] ===== STEP 5: OAuth Error Detected =====");
      console.error("[OAuth Init] Provider: x");
      console.error("[OAuth Init] Error Message:", error.message);
      console.error("[OAuth Init] Error Status:", error.status);
      console.error("[OAuth Init] Error Name:", error.name);
      console.error("[OAuth Init] Error Object:", JSON.stringify(error, null, 2));
      console.error("[OAuth Init] Redirect URL Used:", redirectTo);
      
      const formattedError = formatOAuthError(error, {
        step: "oauth_url_generation",
        appUrl: cleanAppUrl,
        redirectUrl: redirectTo,
        supabaseUrl: supabaseUrl,
      });
      
      console.error("[OAuth Init] Error Category:", formattedError.category);
      console.error("[OAuth Init] Error Message:", formattedError.message);
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(formattedError))}`,
          cleanAppUrl
        )
      );
    }

    // ===== STEP 6: Validate OAuth URL Was Returned =====
    if (!data?.url) {
      console.error("[OAuth Init] ===== STEP 6: No OAuth URL Returned =====");
      console.error("[OAuth Init] Provider: x");
      console.error("[OAuth Init] Redirect URL:", redirectTo);
      console.error("[OAuth Init] This usually means Supabase rejected the request");
      
      const noUrlError = formatOAuthError(
        { message: "No OAuth URL returned from Supabase", status: 400 },
        {
          step: "oauth_url_validation",
          appUrl: cleanAppUrl,
          redirectUrl: redirectTo,
          supabaseUrl: supabaseUrl,
        }
      );
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(noUrlError))}`,
          cleanAppUrl
        )
      );
    }
    
    console.log("[OAuth Init] OAuth URL received:", data.url.substring(0, 100) + "...");
    
    // ===== STEP 7: Validate URL Format =====
    console.log("[OAuth Init] ===== STEP 7: Validating OAuth URL Format =====");
    
    try {
      const urlObj = new URL(data.url);
      
      if (!urlObj.hostname.includes("supabase.co")) {
        throw new Error("Invalid OAuth URL hostname - not a Supabase URL");
      }
      
      console.log("[OAuth Init] URL format is valid");
      console.log("[OAuth Init] Hostname:", urlObj.hostname);
      console.log("[OAuth Init] Path:", urlObj.pathname);
      
      // ===== STEP 8: Test Authorize URL (Backend Validation) =====
      console.log("[OAuth Init] ===== STEP 8: Testing Authorize URL (Backend Check) =====");
      
      try {
        // Use GET instead of HEAD as some endpoints (including Supabase/Twitter) 
        // may return 405 Method Not Allowed for HEAD requests.
        const testResponse = await fetch(data.url, {
          method: "GET",
          redirect: "manual",
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        const status = testResponse.status;
        console.log("[OAuth Init] Authorize URL test status:", status);
        
        // 302 Found is the expected status for a successful redirect to Twitter.
        // We only treat statuses >= 400 as actual errors.
        if (status >= 400 && status !== 405) {
          // Backend rejected - get error details
          console.error("[OAuth Init] Backend rejected authorize URL (status", status + ")");
          
          try {
            const errorResponse = await fetch(data.url, {
              method: "GET",
              redirect: "manual",
              signal: AbortSignal.timeout(10000),
            });
            const errorText = await errorResponse.text();
            
            try {
              const errorJson = JSON.parse(errorText);
              console.error("[OAuth Init] Backend error:", errorJson);
              
              if (
                errorJson.error_code === "validation_failed" ||
                errorJson.msg?.includes("provider is not enabled")
              ) {
                const backendError = formatOAuthError(
                  { message: "Backend says provider is not enabled", status: 400, ...errorJson },
                  {
                    step: "backend_validation",
                    appUrl: cleanAppUrl,
                    redirectUrl: redirectTo,
                    supabaseUrl: supabaseUrl,
                  }
                );
                
                return NextResponse.redirect(
                  new URL(
                    `/auth/login?error=${encodeURIComponent(createErrorMessage(backendError))}`,
                    cleanAppUrl
                  )
                );
              }
            } catch {
              console.error("[OAuth Init] Backend error response (not JSON):", errorText.substring(0, 200));
            }
          } catch (fetchError: any) {
            console.error("[OAuth Init] Failed to get error details:", fetchError.message);
          }
          
          // Generic backend rejection error
          const backendRejectError = formatOAuthError(
            { message: `Backend rejected OAuth request (status ${status})`, status },
            {
              step: "backend_validation",
              appUrl: cleanAppUrl,
              redirectUrl: redirectTo,
              supabaseUrl: supabaseUrl,
            }
          );
          
          return NextResponse.redirect(
            new URL(
              `/auth/login?error=${encodeURIComponent(createErrorMessage(backendRejectError))}`,
              cleanAppUrl
            )
          );
        } else if (status >= 300 && status < 400) {
          // Redirect means it's working
          const location = testResponse.headers.get("location");
          console.log("[OAuth Init] ✅ Authorize URL test passed - redirects to:", location?.substring(0, 100));
          console.log("[OAuth Init] Backend recognizes provider");
        } else {
          console.log("[OAuth Init] ✅ Authorize URL test passed (status", status + ")");
        }
      } catch (testError: any) {
        // Network/timeout error - log but don't block (might be temporary)
        console.warn("[OAuth Init] Could not test authorize URL (non-critical):", testError.message);
        console.log("[OAuth Init] Proceeding with redirect (URL format is valid)");
      }
    } catch (urlError: any) {
      console.error("[OAuth Init] Invalid OAuth URL format:", urlError.message);
      const urlFormatError = formatOAuthError(urlError, {
        step: "url_validation",
        appUrl: cleanAppUrl,
        redirectUrl: redirectTo,
        supabaseUrl: supabaseUrl,
      });
      
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(createErrorMessage(urlFormatError))}`,
          cleanAppUrl
        )
      );
    }

    // ===== STEP 9: Success - Redirect to OAuth =====
    console.log("[OAuth Init] ===== STEP 9: SUCCESS - Redirecting to OAuth =====");
    console.log("[OAuth Init] OAuth URL:", data.url);
    console.log("[OAuth Init] All checks passed - redirecting user to Twitter OAuth");
    
    return NextResponse.redirect(data.url);
  } catch (error: any) {
    // ===== CATCH ALL: Unexpected Errors =====
    console.error("[OAuth Init] ===== UNEXPECTED ERROR (Catch All) =====");
    console.error("[OAuth Init] Error Type:", error?.constructor?.name);
    console.error("[OAuth Init] Error Message:", error?.message);
    console.error("[OAuth Init] Error Stack:", error?.stack);
    console.error("[OAuth Init] ========================================");
    
    const unexpectedError = formatOAuthError(error, {
      step: "unexpected_error",
      appUrl: cleanAppUrl || "http://localhost:3000",
    });
    
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(createErrorMessage(unexpectedError))}`,
        cleanAppUrl || "http://localhost:3000"
      )
    );
  }
}

