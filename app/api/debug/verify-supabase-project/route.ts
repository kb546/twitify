import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * Verify we're connected to the correct Supabase project
 * This helps ensure we're not accidentally using wrong project
 */
export async function GET(request: NextRequest) {
  const result: any = {
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
      expectedProjectId: "cwdfqloiodoburllwpqe",
      urlMatches: false,
    },
    supabase: {
      clientCreated: false,
      projectId: null,
      error: null,
    },
    conclusion: null,
  };

  try {
    // Check if URL contains expected project ID
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    result.environment.urlMatches = supabaseUrl.includes(result.environment.expectedProjectId);

    if (!result.environment.urlMatches) {
      result.conclusion = `❌ MISMATCH: Supabase URL doesn't contain expected project ID '${result.environment.expectedProjectId}'. Are you using the correct Supabase project?`;
      return NextResponse.json(result, { status: 200 });
    }

    // Try to create client and get project info
    try {
      const supabase = await createClient();
      result.supabase.clientCreated = !!supabase;

      if (supabase) {
        // Extract project ID from URL
        const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
        if (urlMatch) {
          result.supabase.projectId = urlMatch[1];
        }

        // Try a simple operation to verify connection
        const { error: testError } = await supabase.auth.getUser();
        
        if (testError) {
          // "Auth session missing" is expected - means connection works
          if (testError.message.includes("Auth session missing") || 
              testError.message.includes("not authenticated")) {
            result.supabase.connectionTest = "SUCCESS - Connection works (no auth session is expected)";
          } else {
            result.supabase.error = testError.message;
          }
        } else {
          result.supabase.connectionTest = "SUCCESS - Connection works";
        }
      }
    } catch (clientError: any) {
      result.supabase.error = clientError.message;
      result.conclusion = `Failed to create Supabase client: ${clientError.message}`;
      return NextResponse.json(result, { status: 200 });
    }

    // Final check
    if (result.supabase.projectId === result.environment.expectedProjectId) {
      result.conclusion = "✅ CORRECT: Using the right Supabase project";
    } else if (result.supabase.projectId) {
      result.conclusion = `⚠️ WARNING: Project ID mismatch. Expected '${result.environment.expectedProjectId}', got '${result.supabase.projectId}'`;
    } else {
      result.conclusion = "⚠️ Could not determine project ID from URL";
    }

  } catch (error: any) {
    result.error = error.message;
    result.conclusion = `Error: ${error.message}`;
  }

  return NextResponse.json(result, { status: 200 });
}

