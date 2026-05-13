# AI Spend Audit 🔍

> Stop overpaying for AI tools. Audit your AI stack and discover hidden savings instantly.

A polished startup-style SaaS web app built with **Next.js 15**, **TypeScript**, and **TailwindCSS** that helps startups and teams identify and eliminate AI tool overspending through rule-based optimization logic and AI-driven insights.

## ✨ Features

- **Landing Page** — Premium, Product Hunt-ready hero with feature cards, how-it-works, testimonials.
- **Audit Form** — Multi-tool form with React Hook Form + Zod validation + localStorage persistence.
- **Audit Engine** — Rule-based optimization logic for ChatGPT, Claude, Cursor, GitHub Copilot, Gemini, and OpenAI API.
- **Results Dashboard** — Per-tool recommendations sorted by priority, monthly + annual savings breakdown, charting.
- **AI-Powered Insights** — Automatically generates an intelligent summary of the user's AI stack (via OpenAI).
- **Lead Capture & Storage** — Capture email and startup details post-audit and store safely in **Supabase**.
- **Transactional Emails** — Automatically email users their verified report via **Resend**.
- **Shareable Reports** — Public dynamic routes for sharing audits securely (`/results/[id]`).
- **SEO & Social Previews** — Dynamic Open Graph and Twitter metadata generation.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Data Storage | Supabase (PostgreSQL) |
| Emails | Resend |
| Analytics | Vercel Analytics |
| Forms | React Hook Form + Zod |
| AI Integration | OpenAI Node.js SDK |
| Testing | Vitest |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase Account (for Database)
- Resend Account (for Emails)
- OpenAI Account (for AI Summaries)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/ai-spend-audit.git
cd ai-spend-audit

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables (.env.local)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend
RESEND_API_KEY=re_xxxxxxxx
```

### Supabase Schema Setup

To set up the database in Supabase, execute the following SQL in your Supabase SQL editor:

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  audit_data JSONB NOT NULL,
  total_savings NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Run Locally

```bash
# Start development server
npm run dev

# Run Vitest tests
npm run test
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🌐 Deployment & Production Readiness

**Deploy to Vercel (recommended):**

1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. In Vercel, navigate to **Settings > Environment Variables** and add all variables from `.env.local`.
4. Deploy! Next.js will automatically utilize the `@vercel/analytics` package included in `layout.tsx` to collect lightweight, privacy-friendly analytics.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API Routes (Email, AI Summary)
│   ├── audit/              # Audit form
│   ├── results/            # Results dashboard and shareable links
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components (shadcn-inspired)
├── hooks/                  # Custom React hooks (Zustand)
├── lib/                    # Supabase, Audit Engine, Utilities
└── types/                  # Shared TypeScript types
```

## 🏗 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed framework decisions, data flow diagrams, and schema details.
