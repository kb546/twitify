/**
 * Comprehensive OAuth Error Handler
 * Provides clear, actionable error messages for every failure point
 */

export interface OAuthError {
  category: string;
  message: string;
  fixSteps: string[];
  diagnosticUrl?: string;
}

export function formatOAuthError(
  error: any,
  context: {
    step: string;
    appUrl: string;
    redirectUrl?: string;
    supabaseUrl?: string;
  }
): OAuthError {
  const { step, appUrl, redirectUrl, supabaseUrl } = context;
  const errorMessage = error?.message || error?.toString() || "Unknown error";
  const errorStatus = error?.status || error?.code;

  // Environment Variable Errors
  if (errorMessage.includes("NEXT_PUBLIC_SUPABASE_URL") || errorMessage.includes("Missing Supabase")) {
    return {
      category: "ENV_MISSING_SUPABASE_URL",
      message: "Supabase URL is not configured",
      fixSteps: [
        "Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
        `Add NEXT_PUBLIC_SUPABASE_URL = https://cwdfqloiodoburllwpqe.supabase.co`,
        "Redeploy after adding the variable",
      ],
      diagnosticUrl: `${appUrl}/api/debug/full-audit`,
    };
  }

  if (errorMessage.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") || errorMessage.includes("anon key")) {
    return {
      category: "ENV_MISSING_SUPABASE_KEY",
      message: "Supabase Anon Key is not configured",
      fixSteps: [
        "Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
        "Add NEXT_PUBLIC_SUPABASE_ANON_KEY (get from Supabase Dashboard → Settings → API)",
        "Redeploy after adding the variable",
      ],
      diagnosticUrl: `${appUrl}/api/debug/full-audit`,
    };
  }

  if (errorMessage.includes("NEXT_PUBLIC_APP_URL")) {
    return {
      category: "ENV_MISSING_APP_URL",
      message: "App URL is not configured",
      fixSteps: [
        "Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
        `Add NEXT_PUBLIC_APP_URL = ${appUrl}`,
        "Make sure there's NO trailing slash",
        "Redeploy after adding the variable",
      ],
      diagnosticUrl: `${appUrl}/api/debug/full-audit`,
    };
  }

  // Supabase Client Creation Errors
  if (errorMessage.includes("createClient") || errorMessage.includes("Supabase client")) {
    return {
      category: "SUPABASE_CLIENT_FAILED",
      message: "Failed to create Supabase client",
      fixSteps: [
        "Check NEXT_PUBLIC_SUPABASE_URL is correct",
        "Check NEXT_PUBLIC_SUPABASE_ANON_KEY is correct",
        "Verify Supabase project is active",
        `Visit ${appUrl}/api/debug/full-audit for complete diagnostics`,
      ],
      diagnosticUrl: `${appUrl}/api/debug/full-audit`,
    };
  }

  // Provider Not Enabled Errors
  if (
    errorMessage.includes("provider is not enabled") ||
    errorMessage.includes("Unsupported provider") ||
    (errorStatus === 400 && errorMessage.includes("provider"))
  ) {
    return {
      category: "PROVIDER_NOT_ENABLED",
      message: "Twitter provider is not enabled in Supabase backend",
      fixSteps: [
        "🔴 CRITICAL: This means UI shows enabled but backend doesn't recognize it",
        "Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/providers",
        'Click "X / Twitter (OAuth 2.0)" (NOT "Twitter (Deprecated)")',
        "Toggle OFF → Wait 60 seconds → Toggle ON",
        "Clear browser cache for Supabase dashboard",
        "DELETE all text in Client ID field",
        "Type exactly: cDhaU2UzbXpFWGpybjlNMEM4Mno6MTpjaQ",
        "DELETE all text in Client Secret field (click eye icon first)",
        "Type exactly: HZjam0f3y3ip0UGC_4OPlSGi1-d18v0T62ggqnGIsTRiYLaRVz",
        'Click "Save" button',
        "Wait 120 seconds (longer than usual)",
        "Refresh Supabase page and verify credentials are still there",
        "Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/url-configuration",
        `Set Site URL to: ${appUrl}`,
        redirectUrl ? `Add Redirect URL: ${redirectUrl}` : "Add Redirect URL",
        "Click Save and wait 60 seconds",
        "Make sure 'Twitter (Deprecated)' is DISABLED",
        `Visit ${appUrl}/api/debug/test-authorize to verify`,
      ],
      diagnosticUrl: `${appUrl}/api/debug/test-authorize`,
    };
  }

  // Redirect URL Errors
  if (errorMessage.includes("redirect") || errorMessage.includes("Redirect URL")) {
    return {
      category: "REDIRECT_URL_ERROR",
      message: `Redirect URL "${redirectUrl}" is not whitelisted or Site URL not configured`,
      fixSteps: [
        "Go to: https://app.supabase.com/project/cwdfqloiodoburllwpqe/auth/url-configuration",
        `Set Site URL to: ${appUrl} (no trailing slash)`,
        redirectUrl ? `Add Redirect URL: ${redirectUrl}` : "Add Redirect URL",
        "Click Save",
        "Wait 60 seconds for changes to propagate",
        `Visit ${appUrl}/api/debug/full-audit to verify`,
      ],
      diagnosticUrl: `${appUrl}/api/debug/full-audit`,
    };
  }

  // URL Validation Errors
  if (errorMessage.includes("Invalid OAuth URL") || errorMessage.includes("URL format")) {
    return {
      category: "INVALID_OAUTH_URL",
      message: "Supabase returned an invalid OAuth URL",
      fixSteps: [
        "This usually means provider configuration is corrupted",
        "Go to Supabase → Auth → Providers → X / Twitter (OAuth 2.0)",
        "Toggle OFF → Wait 60s → Toggle ON",
        "Re-enter credentials and save",
        "Wait 120 seconds",
        `Visit ${appUrl}/api/debug/test-authorize to test`,
      ],
      diagnosticUrl: `${appUrl}/api/debug/test-authorize`,
    };
  }

  // Network Errors
  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("timeout")
  ) {
    return {
      category: "NETWORK_ERROR",
      message: "Network error connecting to Supabase",
      fixSteps: [
        "Check your internet connection",
        "Verify Supabase project is not paused",
        "Check if Supabase is experiencing downtime",
        "Try again in a few minutes",
        `Visit ${appUrl}/api/debug/full-audit to check connection`,
      ],
      diagnosticUrl: `${appUrl}/api/debug/full-audit`,
    };
  }

  // Generic 400 Errors
  if (errorStatus === 400) {
    return {
      category: "BAD_REQUEST",
      message: `Bad request to Supabase (HTTP 400): ${errorMessage}`,
      fixSteps: [
        "This usually indicates a configuration issue",
        "Check provider is enabled in Supabase",
        "Check Site URL is configured",
        "Check Redirect URL is whitelisted",
        `Visit ${appUrl}/api/debug/full-audit for complete diagnostics`,
      ],
      diagnosticUrl: `${appUrl}/api/debug/full-audit`,
    };
  }

  // Generic Error
  return {
    category: "UNKNOWN_ERROR",
    message: `Unexpected error at step "${step}": ${errorMessage}`,
    fixSteps: [
      `Error occurred during: ${step}`,
      "Check server logs for more details",
      `Visit ${appUrl}/api/debug/full-audit for complete diagnostics`,
      "If problem persists, check Supabase status page",
    ],
    diagnosticUrl: `${appUrl}/api/debug/full-audit`,
  };
}

export function createErrorMessage(error: OAuthError): string {
  const lines = [
    `❌ ${error.message}`,
    "",
    "🔧 Fix Steps:",
    ...error.fixSteps.map((step, i) => `${i + 1}. ${step}`),
  ];

  if (error.diagnosticUrl) {
    lines.push("", `🔍 For detailed diagnostics, visit: ${error.diagnosticUrl}`);
  }

  return lines.join("\n");
}

