import { NextRequest, NextResponse } from "next/server";
import { postScheduledTweets } from "@/lib/jobs/tweet-poster";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await postScheduledTweets();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in scheduled tweets cron:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

