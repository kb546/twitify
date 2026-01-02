import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // This route initiates Twitter OAuth - users don't need to be authenticated yet
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitter",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.url) {
    return NextResponse.json({ error: "Failed to generate OAuth URL" }, { status: 500 });
  }

  return NextResponse.redirect(data.url);
}

