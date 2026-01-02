export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      twitter_accounts: {
        Row: {
          id: string;
          user_id: string;
          twitter_user_id: string;
          username: string;
          access_token: string;
          refresh_token: string | null;
          token_expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          twitter_user_id: string;
          username: string;
          access_token: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          twitter_user_id?: string;
          username?: string;
          access_token?: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      scheduled_tweets: {
        Row: {
          id: string;
          user_id: string;
          twitter_account_id: string;
          content: string;
          scheduled_for: string;
          status: "scheduled" | "posting" | "posted" | "failed";
          posted_at: string | null;
          tweet_id: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          twitter_account_id: string;
          content: string;
          scheduled_for: string;
          status?: "scheduled" | "posting" | "posted" | "failed";
          posted_at?: string | null;
          tweet_id?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          twitter_account_id?: string;
          content?: string;
          scheduled_for?: string;
          status?: "scheduled" | "posting" | "posted" | "failed";
          posted_at?: string | null;
          tweet_id?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tweet_analytics: {
        Row: {
          id: string;
          user_id: string;
          twitter_account_id: string;
          tweet_id: string;
          content: string;
          likes_count: number;
          retweets_count: number;
          replies_count: number;
          impressions: number;
          engagement_rate: number;
          posted_at: string | null;
          last_synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          twitter_account_id: string;
          tweet_id: string;
          content: string;
          likes_count?: number;
          retweets_count?: number;
          replies_count?: number;
          impressions?: number;
          engagement_rate?: number;
          posted_at?: string | null;
          last_synced_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          twitter_account_id?: string;
          tweet_id?: string;
          content?: string;
          likes_count?: number;
          retweets_count?: number;
          replies_count?: number;
          impressions?: number;
          engagement_rate?: number;
          posted_at?: string | null;
          last_synced_at?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: "free" | "pro" | "enterprise";
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: "free" | "pro" | "enterprise";
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: "free" | "pro" | "enterprise";
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          metadata: Json | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          metadata?: Json | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          metadata?: Json | null;
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

