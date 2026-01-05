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
  const [isPreviewDomain, setIsPreviewDomain] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error in URL params
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    // Detect if accessed via preview domain
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      const isPreview = currentOrigin.includes("vercel.app") && !currentOrigin.includes("twitify.tech");
      setIsPreviewDomain(isPreview);
      
      if (isPreview) {
        console.warn("[Login] Accessed via preview domain:", currentOrigin);
        console.warn("[Login] OAuth will use production domain:", process.env.NEXT_PUBLIC_APP_URL || "https://twitify.tech");
      }

      // Only create client on client side after mount
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
    try {
      setLoading(true);
      setError(null);
      
      // Use direct navigation instead of fetch() for OAuth initiation
      // This ensures redirects work properly and errors are visible in URL params
      console.log("[Login] Initiating OAuth via direct navigation to API route");
      
      // Direct navigation to API route - it will handle redirects properly
      // If there's an error, API route will redirect back with error in URL params
      window.location.href = '/api/auth/twitter';
      
      // Note: We don't need to handle the response here because:
      // 1. On success: API route redirects to Supabase OAuth → Twitter
      // 2. On error: API route redirects back to /auth/login?error=...
      // The error will be picked up by useEffect when page loads
    } catch (error: any) {
      console.error("[Login] Error initiating OAuth:", error);
      const errorMessage = error?.message || "Failed to initiate OAuth flow";
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
          {isPreviewDomain && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">⚠️ Preview Domain Detected</p>
              <p className="text-sm text-yellow-700 mt-1">
                You&apos;re accessing via a preview URL. For OAuth to work correctly, please use{" "}
                <a href="https://twitify.tech/auth/login" className="underline font-medium">https://twitify.tech/auth/login</a>
              </p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1 whitespace-pre-wrap break-words">{error}</p>
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

              <div className="flex justify-center space-x-4 text-xs text-gray-500 mt-4">
                <a href="/privacy" className="hover:underline">Privacy Policy</a>
                <a href="/terms" className="hover:underline">Terms of Service</a>
              </div>

              {(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_URL) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
              <p>Current Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
              <p>Will use: {(process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'N/A')).replace(/\/$/, "")}</p>
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

