import { getTwitterBearerClient } from "./client";

export async function getTrendingTopics(woeid: number = 1) {
  try {
    const client = getTwitterBearerClient();
    const trends = await client.v1.trendsByPlace(woeid);
    return trends[0]?.trends || [];
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    throw error;
  }
}

export async function getTrendingHashtags(woeid: number = 1) {
  const trends = await getTrendingTopics(woeid);
  return trends
    .filter((trend) => trend.name.startsWith("#"))
    .map((trend) => trend.name)
    .slice(0, 10);
}

