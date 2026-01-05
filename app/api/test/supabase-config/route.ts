import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const config: any = {
      timestamp: new Date().toISOString(),
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(process.env.NEXT_PUBLIC_SUPABASE_URL.length - 10)}`
          : "NOT SET",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 10)}`
          : "NOT SET",
        clientCreated: false,
        connectionTest: null,
      },
      app: {
        url: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
        redirectUrl: null,
      },
      status: "checking",
    };

    // Calculate redirect URL
    if (process.env.NEXT_PUBLIC_APP_URL) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
      config.app.redirectUrl = `${appUrl}/auth/callback`;
    }

    // Test Supabase connection
    try {
      const supabase = await createClient();
      config.supabase.clientCreated = !!supabase;

      if (supabase) {
        // Try to get current user (this tests the connection)
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        config.supabase.connectionTest = {
          success: !userError,
          error: userError?.message || null,
          hasUser: !!userData?.user,
        };
      }
    } catch (error: any) {
      config.supabase.connectionTest = {
        success: false,
        error: error.message,
      };
    }

    config.status = config.supabase.clientCreated && config.supabase.connectionTest?.success 
      ? "connected" 
      : "failed";

    return NextResponse.json(config, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Config test failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

