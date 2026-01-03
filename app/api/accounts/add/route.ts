import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This endpoint would handle adding additional Twitter accounts
    // For now, accounts are added during OAuth callback
    return NextResponse.json({ message: "Account addition handled via OAuth" });
  } catch (error: any) {
    console.error("Error adding account:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

