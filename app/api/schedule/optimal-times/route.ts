import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOptimalTimes } from "@/lib/analytics/time-optimizer";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const twitterAccountId = searchParams.get("account_id") || undefined;

    const optimalTimes = await getOptimalTimes(user.id, twitterAccountId);

    return NextResponse.json({
      optimalTimes: optimalTimes.map((time) => time.toISOString()),
    });
  } catch (error: any) {
    console.error("Error fetching optimal times:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

