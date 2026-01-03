import { NextResponse } from "next/server";
import { syncAnalytics } from "@/lib/jobs/analytics-syncer";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await syncAnalytics();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error syncing analytics:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

