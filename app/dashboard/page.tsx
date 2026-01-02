import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: scheduledCount } = await supabase
    .from("scheduled_tweets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id || "")
    .eq("status", "scheduled");

  const { count: accountsCount } = await supabase
    .from("twitter_accounts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id || "");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Tweets</CardTitle>
            <CardDescription>Upcoming posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Twitter Accounts</CardTitle>
            <CardDescription>Connected accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountsCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

