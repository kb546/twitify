import { NextRequest, NextResponse } from "next/server";
import { syncAnalytics } from "@/lib/jobs/analytics-syncer";

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
    await syncAnalytics();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in analytics sync cron:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

