import { NextResponse } from "next/server";
import { getTrendingHashtags } from "@/lib/twitter/trending";

export async function GET() {
  try {
    const hashtags = await getTrendingHashtags();
    return NextResponse.json({ hashtags });
  } catch (error: any) {
    console.error("Error fetching trending topics:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

