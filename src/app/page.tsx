import Link from "next/link";
import type { Metadata } from "next";
import {
  Zap,
  TrendingDown,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Stop Overpaying for AI Tools | AI Spend Audit",
  description:
    "Audit your AI stack and discover hidden savings instantly. Free rule-based analysis for ChatGPT, Claude, Cursor, GitHub Copilot, Gemini, and more.",
};

// ─── Data ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: TrendingDown,
    title: "Identify Overspending",
    description:
      "Our rule-based engine detects over-provisioned plans, redundant seats, and mismatched tiers instantly.",
    color: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-400",
  },
  {
    icon: BarChart3,
    title: "Per-Tool Breakdown",
    description:
      "Get a detailed savings breakdown for every AI tool in your stack — from ChatGPT to GitHub Copilot.",
    color: "from-indigo-500/20 to-indigo-500/5",
    iconColor: "text-indigo-400",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "No data sent to servers. All calculations happen locally in your browser. Zero tracking.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "No sign-up required. Enter your tools and see your optimization recommendations in seconds.",
    color: "from-yellow-500/20 to-yellow-500/5",
    iconColor: "text-yellow-400",
  },
  {
    icon: Clock,
    title: "Track Over Time",
    description:
      "Your audit data is saved locally so you can come back and compare your savings progress.",
    color: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-400",
  },
  {
    icon: DollarSign,
    title: "Real Savings Math",
    description:
      "Not estimates — exact monthly and annual savings based on published pricing from each vendor.",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-400",
  },
];

const supportedTools = [
  { name: "ChatGPT", company: "OpenAI", color: "bg-emerald-500/20 text-emerald-400" },
  { name: "Claude", company: "Anthropic", color: "bg-orange-500/20 text-orange-400" },
  { name: "Cursor", company: "Anysphere", color: "bg-violet-500/20 text-violet-400" },
  { name: "GitHub Copilot", company: "Microsoft", color: "bg-slate-500/20 text-slate-300" },
  { name: "Gemini", company: "Google", color: "bg-blue-500/20 text-blue-400" },
  { name: "OpenAI API", company: "OpenAI", color: "bg-teal-500/20 text-teal-400" },
];

const stats = [
  { value: "$2,400+", label: "Avg yearly savings found" },
  { value: "6", label: "AI tools analyzed" },
  { value: "100%", label: "Free, no sign-up" },
  { value: "< 2 min", label: "Time to complete audit" },
];

const steps = [
  {
    step: "01",
    title: "Add Your AI Tools",
    description: "Enter each AI tool you're paying for, your current plan, monthly spend, and number of seats.",
  },
  {
    step: "02",
    title: "Run the Audit",
    description: "Our rule engine analyzes your stack against known pricing tiers and optimization patterns.",
  },
  {
    step: "03",
    title: "See Your Savings",
    description: "Get a clear breakdown of monthly and annual savings with specific plan recommendations.",
  },
];

const testimonials = [
  {
    quote: "We were paying for ChatGPT Team with 2 users. Switching to Plus saved us $60/month — that's $720/year!",
    author: "Sarah K.",
    role: "Founder, early-stage startup",
  },
  {
    quote: "Found out we had Cursor Business for 3 devs when Pro would do the same job for 50% less. Easy win.",
    author: "Marcus T.",
    role: "CTO, Series A",
  },
  {
    quote: "Took 90 seconds and flagged $200/month in overspending. Absolute no-brainer tool for any startup.",
    author: "Priya M.",
    role: "Head of Engineering",
  },
];

// ─── Component ────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-violet-600/12 via-indigo-600/6 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[88vh] px-4 sm:px-6 text-center py-20"
        aria-labelledby="hero-heading"
      >
        {/* Badge */}
        <div className="mb-6 animate-fade-in-up">
          <Badge variant="info" className="px-4 py-1.5 text-sm gap-2">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Free AI Stack Optimization · No Sign-up Required
          </Badge>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-3xl mx-auto animate-fade-in-up delay-100 opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          Stop{" "}
          <span className="gradient-text">Overpaying</span>
          <br />
          for AI Tools
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 opacity-0" style={{ animationFillMode: "forwards" }}>
          Audit your AI stack and discover hidden savings instantly.
          <br className="hidden sm:block" />
          Rule-based analysis — no AI, no guesswork, just math.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center animate-fade-in-up delay-300 opacity-0" style={{ animationFillMode: "forwards" }}>
          <Link href="/audit">
            <Button size="lg" className="animate-pulse-glow">
              Get Free Audit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="secondary" size="lg">
              How it works
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 animate-fade-in-up delay-400 opacity-0" style={{ animationFillMode: "forwards" }}>
          {["No sign-up required", "Data stays in browser", "Takes under 2 minutes", "100% free"].map((text) => (
            <div key={text} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 w-full max-w-4xl mx-auto animate-fade-in-up delay-500 opacity-0" style={{ animationFillMode: "forwards" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-[#0a0a0f] px-6 py-5 text-center"
              >
                <p className="text-2xl font-bold text-white font-mono-numbers">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Supported Tools ───────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6" aria-labelledby="tools-heading">
        <div className="mx-auto max-w-7xl">
          <p
            id="tools-heading"
            className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider mb-8"
          >
            Analyzing spending across
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {supportedTools.map(({ name, company, color }) => (
              <div
                key={name}
                className={`flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium ${color} bg-white/5`}
              >
                <span className={`h-2 w-2 rounded-full ${color.replace("text-", "bg-").replace("/20", "/60")}`} aria-hidden="true" />
                <span>{name}</span>
                <span className="text-xs text-slate-600">by {company}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6"
        aria-labelledby="features-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Features</Badge>
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl font-bold text-white"
            >
              Everything you need to optimize
              <br />
              <span className="gradient-text">your AI spending</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              A complete toolkit to audit, analyze, and act on your AI tool costs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description, color, iconColor }) => (
              <Card key={title} hover className="group transition-all duration-300">
                <CardContent className="p-6">
                  <div
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-4 sm:px-6"
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Process</Badge>
            <h2
              id="how-heading"
              className="text-3xl sm:text-4xl font-bold text-white"
            >
              How the audit works
            </h2>
            <p className="mt-4 text-slate-400">
              Three simple steps to find your savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines (hidden on mobile) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" aria-hidden="true" />

            {steps.map(({ step, title, description }, i) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 font-bold text-lg font-mono-numbers">
                  {step}
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/audit">
              <Button size="lg">
                Start Your Free Audit
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Social Proof</Badge>
            <h2
              id="testimonials-heading"
              className="text-3xl font-bold text-white"
            >
              Teams saving with{" "}
              <span className="gradient-text">AI Spend Audit</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, author, role }) => (
              <Card key={author} hover className="flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <blockquote className="text-slate-300 text-sm leading-relaxed flex-1">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <footer className="mt-5 pt-5 border-t border-white/8">
                    <p className="text-sm font-medium text-white">{author}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{role}</p>
                  </footer>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl">
          <Card gradient className="relative overflow-hidden text-center p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-indigo-600/15" aria-hidden="true" />
            <CardContent className="relative py-12 px-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-500/30 mb-6 mx-auto animate-float">
                <Zap className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <h2
                id="cta-heading"
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
              >
                Ready to stop overpaying?
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Takes under 2 minutes. No account needed. See exactly how much you could save today.
              </p>
              <Link href="/audit">
                <Button size="lg" className="animate-pulse-glow">
                  Get Free Audit Now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
