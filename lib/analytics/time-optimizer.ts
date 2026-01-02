import { createClient } from "@/lib/supabase/server";

export async function getOptimalTimes(
  userId: string,
  twitterAccountId?: string
): Promise<Date[]> {
  const supabase = await createClient();

  // Get historical tweet analytics
  let query = supabase
    .from("tweet_analytics")
    .select("posted_at, engagement_rate, impressions")
    .eq("user_id", userId)
    .not("posted_at", "is", null)
    .order("posted_at", { ascending: false })
    .limit(100);

  if (twitterAccountId) {
    query = query.eq("twitter_account_id", twitterAccountId);
  }

  const { data: analytics } = await query;

  if (!analytics || analytics.length === 0) {
    // Return default optimal times if no data
    return getDefaultOptimalTimes();
  }

  // Group by hour of day
  const hourlyEngagement: Record<number, { total: number; count: number }> = {};

  analytics.forEach((item) => {
    if (item.posted_at) {
      const hour = new Date(item.posted_at).getHours();
      const engagement = (item.engagement_rate || 0) * (item.impressions || 0);

      if (!hourlyEngagement[hour]) {
        hourlyEngagement[hour] = { total: 0, count: 0 };
      }

      hourlyEngagement[hour].total += engagement;
      hourlyEngagement[hour].count += 1;
    }
  });

  // Calculate average engagement per hour
  const hourlyAverages: Array<{ hour: number; avg: number }> = Object.entries(
    hourlyEngagement
  ).map(([hour, data]) => ({
    hour: parseInt(hour),
    avg: data.total / data.count,
  }));

  // Sort by average engagement
  hourlyAverages.sort((a, b) => b.avg - a.avg);

  // Get top 3 hours
  const topHours = hourlyAverages.slice(0, 3).map((item) => item.hour);

  // Generate optimal times for today and tomorrow
  const optimalTimes: Date[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  topHours.forEach((hour) => {
    const todayTime = new Date(today);
    todayTime.setHours(hour, 0, 0, 0);
    if (todayTime > new Date()) {
      optimalTimes.push(todayTime);
    }

    const tomorrowTime = new Date(tomorrow);
    tomorrowTime.setHours(hour, 0, 0, 0);
    optimalTimes.push(tomorrowTime);
  });

  return optimalTimes.sort((a, b) => a.getTime() - b.getTime());
}

function getDefaultOptimalTimes(): Date[] {
  // Default optimal times based on general Twitter engagement patterns
  const times: Date[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Common optimal hours: 9 AM, 12 PM, 5 PM
  const optimalHours = [9, 12, 17];

  optimalHours.forEach((hour) => {
    const todayTime = new Date(today);
    todayTime.setHours(hour, 0, 0, 0);
    if (todayTime > new Date()) {
      times.push(todayTime);
    }

    const tomorrowTime = new Date(tomorrow);
    tomorrowTime.setHours(hour, 0, 0, 0);
    times.push(tomorrowTime);
  });

  return times.sort((a, b) => a.getTime() - b.getTime());
}

