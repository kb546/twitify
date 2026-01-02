"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error in URL params
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    // Only create client on client side after mount
    if (typeof window !== 'undefined') {
      try {
        const client = createClient();
        setSupabase(client);
      } catch (error: any) {
        console.error("Failed to initialize Supabase client:", error);
        setError(`Failed to initialize authentication: ${error?.message || "Unknown error"}`);
      }
    }
  }, [searchParams]);

  const handleTwitterLogin = async () => {
    if (!supabase) {
      setError("Authentication service is not available. Please check your configuration.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log("[Login] Initiating OAuth with redirectTo:", redirectTo);
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        console.error("[Login] OAuth error:", oauthError);
        throw oauthError;
      }

      if (!data?.url) {
        throw new Error("No OAuth URL returned. Please check Supabase Twitter provider configuration.");
      }

      // Redirect will happen automatically via data.url
      console.log("[Login] Redirecting to OAuth URL");
    } catch (error: any) {
      console.error("[Login] Error signing in:", error);
      const errorMessage = error?.message || "Failed to sign in with Twitter";
      setError(`Authentication Error: ${errorMessage}. Please check your configuration and try again.`);
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
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}
          <Button
            onClick={handleTwitterLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Connecting..." : "Sign in with Twitter"}
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>App URL: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
              <p>Supabase: {supabase ? 'Connected' : 'Not connected'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

