# AI Spend Audit 🔍

> Stop overpaying for AI tools. Audit your AI stack and discover hidden savings instantly.

A polished startup-style SaaS web app built with **Next.js 15**, **TypeScript**, and **TailwindCSS** that helps startups and teams identify and eliminate AI tool overspending through rule-based optimization logic.

## ✨ Features

- **Landing Page** — Premium, Product Hunt-ready hero with feature cards, how-it-works, testimonials
- **Audit Form** — Multi-tool form with React Hook Form + Zod validation + localStorage persistence
- **Audit Engine** — Rule-based optimization logic (no AI, just math) for ChatGPT, Claude, Cursor, GitHub Copilot, Gemini, and OpenAI API
- **Results Dashboard** — Per-tool recommendations sorted by priority, monthly + annual savings breakdown
- **100% Private** — All calculations happen in the browser. Zero data sent to servers.
- **No Sign-up** — Works immediately without authentication.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Forms | React Hook Form + Zod |
| Persistence | localStorage (client-side) |
| Icons | Lucide React |
| Fonts | Inter (Google Fonts via next/font) |
| Deployment | Vercel |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/ai-spend-audit.git
cd ai-spend-audit

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with Navbar + Footer
│   ├── globals.css         # Design system CSS
│   ├── page.tsx            # Landing page
│   ├── audit/page.tsx      # Audit form
│   └── results/page.tsx    # Results dashboard
├── components/
│   ├── layout/             # Navbar, Footer
│   └── ui/                 # Button, Card, Input, Select, Badge, Skeleton
├── hooks/
│   └── useAuditStore.ts    # localStorage persistence hook
├── lib/
│   ├── auditEngine.ts      # Rule-based savings engine
│   └── utils.ts            # cn(), formatCurrency(), formatPercent()
└── types/
    └── audit.ts            # Shared TypeScript types
```

## 🔧 Available Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🏗 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Framework decision rationale
- System data flow diagram (Mermaid)
- Scalability plan (up to 10k audits/day)
- Deployment guide

## 🌐 Deployment

**Deploy to Vercel (recommended):**

```bash
# Via Vercel CLI
npx vercel --prod

# Or connect GitHub repo at vercel.com → automatic deploys on push
```

Add environment variables in the Vercel dashboard (Settings → Environment Variables).

## 📅 Day 2 Roadmap

- [ ] Email results feature (Resend)
- [ ] Anonymous audit persistence (Postgres/Drizzle)  
- [ ] Shareable audit URLs
- [ ] More tools: Midjourney, Perplexity, Notion AI
- [ ] User accounts + audit history (Clerk)
- [ ] Analytics (PostHog)

## DAY2 TASK FINISHED
Updated project documentation

