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
    const { goals, categories } = body;

    // Save user preferences
    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        goals: goals || [],
        categories: categories || [],
        onboarding_completed: true,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving onboarding data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

