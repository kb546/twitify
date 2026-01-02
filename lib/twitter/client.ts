import { TwitterApi } from "twitter-api-v2";

export function getTwitterClient(accessToken: string) {
  return new TwitterApi(accessToken);
}

export function getTwitterBearerClient() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error("TWITTER_BEARER_TOKEN is not set");
  }
  return new TwitterApi(bearerToken);
}

export function getTwitterOAuthClient() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Twitter OAuth credentials are not set");
  }
  
  return new TwitterApi({
    clientId,
    clientSecret,
  });
}

