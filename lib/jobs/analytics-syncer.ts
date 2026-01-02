import { createClient } from "@/lib/supabase/server";
import { getTwitterClient } from "@/lib/twitter/client";
import { refreshTwitterToken } from "@/lib/twitter/refresh-token";

export async function syncAnalytics() {
  const supabase = await createClient();

  // Get all active Twitter accounts
  const { data: accounts, error } = await supabase
    .from("twitter_accounts")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching accounts:", error);
    return;
  }

  if (!accounts || accounts.length === 0) {
    return;
  }

  for (const account of accounts) {
    try {
      // Check if token needs refresh
      let accessToken = account.access_token;
      if (
        account.token_expires_at &&
        new Date(account.token_expires_at) < new Date() &&
        account.refresh_token
      ) {
        accessToken = await refreshTwitterToken(
          account.user_id,
          account.id,
          account.refresh_token
        );
      }

      // Fetch user's tweets from Twitter API
      const twitterClient = getTwitterClient(accessToken);
      const tweets = await twitterClient.v2.userTimeline(account.twitter_user_id, {
        max_results: 100,
        "tweet.fields": ["public_metrics", "created_at"],
      });

      // Sync analytics for each tweet
      const analyticsToUpsert =
        tweets.data.data?.map((tweet: any) => {
          const metrics = tweet.public_metrics || {};
          return {
            user_id: account.user_id,
            twitter_account_id: account.id,
            tweet_id: tweet.id,
            content: tweet.text,
            likes_count: metrics.like_count || 0,
            retweets_count: metrics.retweet_count || 0,
            replies_count: metrics.reply_count || 0,
            impressions: metrics.impression_count || 0,
            engagement_rate:
              metrics.impression_count > 0
                ? ((metrics.like_count || 0) +
                    (metrics.retweet_count || 0) +
                    (metrics.reply_count || 0)) /
                  metrics.impression_count
                : 0,
            posted_at: tweet.created_at,
            last_synced_at: new Date().toISOString(),
          };
        }) || [];

      // Upsert analytics
      for (const analytics of analyticsToUpsert) {
        await supabase.from("tweet_analytics").upsert(analytics, {
          onConflict: "twitter_account_id,tweet_id",
        });
      }

      console.log(`Synced ${analyticsToUpsert.length} tweets for account ${account.username}`);
    } catch (error) {
      console.error(`Error syncing analytics for account ${account.id}:`, error);
    }
  }
}

