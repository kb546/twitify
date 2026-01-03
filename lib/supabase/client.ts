import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    // Return a mock client during build to prevent errors
    // This will be replaced with real client at runtime
    return createBrowserClient(
      url || "https://placeholder.supabase.co",
      key || "placeholder-key"
    );
  }
  
  return createBrowserClient(url, key);
}

