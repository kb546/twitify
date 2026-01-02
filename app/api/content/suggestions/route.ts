import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMultipleSuggestions } from "@/lib/ai/content-generator";
import { canUseAISuggestions } from "@/lib/stripe/feature-gating";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user can use AI suggestions
    const canUseAI = await canUseAISuggestions(user.id);
    if (!canUseAI) {
      return NextResponse.json(
        { error: "AI suggestions require a Pro or Enterprise plan" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { count = 5, trendingTopics = [], categories = [], goals = [], tone = "professional" } = body;

    const suggestions = await generateMultipleSuggestions(count, {
      trendingTopics,
      categories,
      goals,
      tone,
    });

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

