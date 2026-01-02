# Twitify

A web app designed to help Twitter users grow their audience and engagement through AI-driven content suggestions, smart scheduling, and real-time analytics.

## Features

- Twitter OAuth authentication
- AI-powered content suggestions (OpenAI & Anthropic)
- Smart scheduling with optimal time suggestions
- Real-time analytics and performance tracking
- Multiple Twitter account management
- Subscription plans (Free, Pro, Enterprise)

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS + shadcn/ui
- OpenAI & Anthropic (AI)
- Stripe (Payments)
- Twitter API v2

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Twitter Developer account
- OpenAI API key
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kb546/twitify.git
cd twitify
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Fill in your API keys
```

4. Run database migration:
- Go to Supabase SQL Editor
- Run `supabase/migrations/001_initial_schema.sql`

5. Start development server:
```bash
npm run dev --legacy-peer-deps
```

## Deployment

See `DEPLOY_NOW.md` for detailed deployment instructions to Vercel.

## Documentation

- `DEPLOY_NOW.md` - Deployment guide
- `API_SETUP_GUIDE.md` - Complete API setup instructions
- `OAUTH_SETUP.md` - Twitter OAuth configuration
- `SETUP_COMPLETE.md` - Setup summary

## License

Private - All rights reserved

