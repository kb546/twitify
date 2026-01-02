import { getTwitterOAuthClient } from "./client";
import { createClient } from "@/lib/supabase/server";

export async function refreshTwitterToken(
  userId: string,
  twitterAccountId: string,
  refreshToken: string
) {
  try {
    const twitterClient = getTwitterOAuthClient();
    const { accessToken, expiresIn } = await twitterClient.refreshOAuth2Token(
      refreshToken
    );

    const supabase = await createClient();
    const { error } = await supabase
      .from("twitter_accounts")
      .update({
        access_token: accessToken,
        token_expires_at: new Date(
          Date.now() + expiresIn * 1000
        ).toISOString(),
      })
      .eq("id", twitterAccountId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return accessToken;
  } catch (error) {
    console.error("Error refreshing Twitter token:", error);
    throw error;
  }
}

