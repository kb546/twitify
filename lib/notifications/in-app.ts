import { createClient } from "@/lib/supabase/server";

export async function createNotification(
  userId: string,
  type: "scheduled_reminder" | "performance_update" | "engagement_insight" | "system",
  title: string,
  message: string,
  metadata?: Record<string, any>
) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    metadata: metadata || null,
    read: false,
  });

  if (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function getUserNotifications(userId: string, limit: number = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }

  return data || [];
}

