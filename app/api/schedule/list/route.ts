import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("scheduled_tweets")
      .select("*, twitter_accounts(*)")
      .eq("user_id", user.id)
      .order("scheduled_for", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ tweets: data || [] });
  } catch (error: any) {
    console.error("Error fetching scheduled tweets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

