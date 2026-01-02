"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    // Only create client on client side after mount
    if (typeof window !== 'undefined') {
      try {
        setSupabase(createClient());
      } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
      }
    }
  }, []);

  const handleTwitterLogin = async () => {
    if (!supabase) {
      alert("Authentication service is not available. Please check your configuration.");
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Failed to sign in with Twitter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Twitify</CardTitle>
          <CardDescription>
            Sign in with your Twitter account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleTwitterLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Connecting..." : "Sign in with Twitter"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

