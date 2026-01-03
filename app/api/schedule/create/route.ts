import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getScheduledTweetLimit, canScheduleUnlimited } from "@/lib/stripe/feature-gating";

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

    const body = await request.json();
    const { content, scheduled_for, twitter_account_id } = body;

    if (!content || !scheduled_for || !twitter_account_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check scheduling limits
    const limit = await getScheduledTweetLimit(user.id);
    if (!(await canScheduleUnlimited(user.id))) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("scheduled_tweets")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString())
        .in("status", ["scheduled", "posted"]);

      if (count && count >= limit) {
        return NextResponse.json(
          { error: `You've reached your monthly limit of ${limit} scheduled tweets. Upgrade to Pro for unlimited scheduling.` },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from("scheduled_tweets")
      .insert({
        user_id: user.id,
        twitter_account_id,
        content,
        scheduled_for,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ tweet: data });
  } catch (error: any) {
    console.error("Error creating scheduled tweet:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

