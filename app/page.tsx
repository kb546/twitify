import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Welcome to Twitify</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Grow your Twitter audience with AI-powered content suggestions
      </p>
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Get Started
      </Link>
    </main>
  );
}

