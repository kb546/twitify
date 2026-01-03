import { getStripeClient } from "./client";
import { createClient } from "@/lib/supabase/server";

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: ["5 scheduled tweets/month", "Basic analytics"],
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Unlimited scheduled tweets",
      "AI content suggestions",
      "Advanced analytics",
      "Multiple accounts",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Priority support",
      "Custom integrations",
    ],
  },
};

export async function getUserPlan(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan_type, status")
    .eq("user_id", userId)
    .single();

  return data?.plan_type || "free";
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const supabase = await createClient();
  
  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const { data: user } = await supabase.auth.getUser();
    const stripe = getStripeClient();
    const customer = await stripe.customers.create({
      metadata: {
        userId,
      },
    });

    customerId = customer.id;

    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", userId);
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

