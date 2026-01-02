import { createClient } from "@/lib/supabase/server";
import { getTwitterClient } from "@/lib/twitter/client";
import { refreshTwitterToken } from "@/lib/twitter/refresh-token";
import { createNotification } from "@/lib/notifications/in-app";

export async function postScheduledTweets() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Get tweets scheduled for now (within the last 5 minutes to account for cron timing)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: scheduledTweets, error } = await supabase
    .from("scheduled_tweets")
    .select("*, twitter_accounts(*)")
    .eq("status", "scheduled")
    .lte("scheduled_for", now)
    .gte("scheduled_for", fiveMinutesAgo);

  if (error) {
    console.error("Error fetching scheduled tweets:", error);
    return;
  }

  if (!scheduledTweets || scheduledTweets.length === 0) {
    return;
  }

  for (const tweet of scheduledTweets) {
    try {
      // Update status to posting
      await supabase
        .from("scheduled_tweets")
        .update({ status: "posting" })
        .eq("id", tweet.id);

      const account = tweet.twitter_accounts;
      if (!account) {
        throw new Error("Twitter account not found");
      }

      // Check if token needs refresh
      let accessToken = account.access_token;
      if (
        account.token_expires_at &&
        new Date(account.token_expires_at) < new Date() &&
        account.refresh_token
      ) {
        accessToken = await refreshTwitterToken(
          tweet.user_id,
          account.id,
          account.refresh_token
        );
      }

      // Post tweet
      const twitterClient = getTwitterClient(accessToken);
      const postedTweet = await twitterClient.v2.tweet({
        text: tweet.content,
        // Note: Media upload would require additional implementation
      });

      // Update status to posted
      await supabase
        .from("scheduled_tweets")
        .update({
          status: "posted",
          posted_at: new Date().toISOString(),
          tweet_id: postedTweet.data.id,
        })
        .eq("id", tweet.id);

      // Create notification
      await createNotification(
        tweet.user_id,
        "scheduled_reminder",
        "Tweet Posted",
        `Your scheduled tweet has been posted successfully.`,
        { tweet_id: postedTweet.data.id }
      );
    } catch (error: any) {
      console.error(`Error posting tweet ${tweet.id}:`, error);

      // Update status to failed
      await supabase
        .from("scheduled_tweets")
        .update({
          status: "failed",
          error_message: error.message || "Unknown error",
        })
        .eq("id", tweet.id);

      // Create error notification
      await createNotification(
        tweet.user_id,
        "system",
        "Tweet Posting Failed",
        `Failed to post your scheduled tweet: ${error.message || "Unknown error"}`,
        { tweet_id: tweet.id }
      );
    }
  }
}

