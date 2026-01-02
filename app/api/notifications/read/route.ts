import { NextRequest, NextResponse } from "next/server";
import { markNotificationAsRead } from "@/lib/notifications/in-app";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    await markNotificationAsRead(user.id, notificationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

