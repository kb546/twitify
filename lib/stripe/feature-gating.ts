import { getUserPlan } from "./subscriptions";

export async function canScheduleUnlimited(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan !== "free";
}

export async function canUseAISuggestions(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan !== "free";
}

export async function canUseAdvancedAnalytics(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan !== "free";
}

export async function canUseMultipleAccounts(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan !== "free";
}

export async function getScheduledTweetLimit(userId: string): Promise<number> {
  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return 5; // Free plan: 5 tweets per month
  }
  return Infinity; // Pro and Enterprise: unlimited
}

