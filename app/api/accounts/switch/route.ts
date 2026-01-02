import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    // Set all accounts to inactive
    await supabase
      .from("twitter_accounts")
      .update({ is_active: false })
      .eq("user_id", user.id);

    // Set selected account to active
    const { error } = await supabase
      .from("twitter_accounts")
      .update({ is_active: true })
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error switching account:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

