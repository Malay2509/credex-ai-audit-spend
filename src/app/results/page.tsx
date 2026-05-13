"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingDown, ArrowRight, CheckCircle2, AlertTriangle,
  XCircle, Sparkles, RotateCcw, ArrowLeft, Trophy, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAuditStore } from "@/hooks/useAuditStore";
import { runAudit, getPriorityLabel } from "@/lib/auditEngine";
import { generateAuditSummary } from "@/lib/generateSummary";
import { AuditResult, AuditRecommendation } from "@/types/audit";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { saveLeadAndAudit } from "@/lib/supabase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";

const leadSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  company_name: z.string().optional(),
  role: z.string().min(2, "Please enter your role."),
  team_size: z.string().min(1, "Please select a team size."),
});
type LeadFormData = z.infer<typeof leadSchema>;

// ─── Animated Counter ─────────────────────────────────────────────────────
function AnimatedCounter({ value, prefix = "", suffix = "", duration = 1200 }: {
  value: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let rafId: number;
    if (value === 0) { 
      rafId = requestAnimationFrame(() => setDisplay(0));
      return () => cancelAnimationFrame(rafId);
    }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);
  return <span className="font-mono-numbers">{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ─── Metric Card ─────────────────────────────────────────────────────────
function MetricCard({ label, value, subtext, highlight, icon, animate }: {
  label: string; value: string; subtext?: string;
  highlight?: boolean; icon?: React.ReactNode; animate?: number;
}) {
  return (
    <Card className={cn("transition-all duration-300",
      highlight && "border-violet-500/40 bg-gradient-to-br from-violet-500/10 to-indigo-500/5"
    )}>
      <CardContent className="p-5">
        {icon && <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">{icon}</div>}
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className={cn("text-2xl font-bold", highlight ? "gradient-text" : "text-white")}>
          {animate !== undefined
            ? <AnimatedCounter value={animate} prefix="$" />
            : value}
        </p>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

// ─── AI Summary Box ───────────────────────────────────────────────────────
function AISummaryBox({ result }: { result: AuditResult }) {
  const [summary, setSummary] = useState("");
  const [isAI, setIsAI] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    generateAuditSummary(result).then(({ text, generatedByAI }) => {
      if (cancelled) return;
      setSummary(text);
      setIsAI(generatedByAI);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [result]);

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-transparent to-indigo-500/5 mb-8">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-violet-400" aria-hidden="true" />
          <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
            {isAI ? "AI-Generated Summary" : "Audit Summary"}
          </span>
        </div>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-5/6" />
            <div className="h-3 bg-white/5 rounded w-4/6" />
          </div>
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Savings Chart ────────────────────────────────────────────────────────
function SavingsChart({ recs }: { recs: AuditRecommendation[] }) {
  const data = recs
    .filter((r) => r.currentMonthlySpend > 0)
    .map((r) => ({
      name: r.tool.replace("GitHub ", "GH ").replace(" API", " API"),
      current: r.currentMonthlySpend,
      optimized: r.optimizedMonthlySpend,
      savings: r.monthlySavings,
    }));

  if (data.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-400">Monthly Spend — Current vs Optimized</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48" role="img" aria-label="Bar chart comparing current vs optimized monthly spend per tool">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${v}`} width={45} />
              <Tooltip
                contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#fff", fontSize: 12 }}
                formatter={(v, name) => [`$${Number(v ?? 0)}`, name === "current" ? "Current" : "Optimized"] as [string, string]}
              />
              <Bar dataKey="current" radius={[4, 4, 0, 0]} name="current">
                {data.map((_, i) => <Cell key={i} fill="rgba(100,116,139,0.4)" />)}
              </Bar>
              <Bar dataKey="optimized" radius={[4, 4, 0, 0]} name="optimized">
                {data.map((_, i) => <Cell key={i} fill="rgba(124,58,237,0.6)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 justify-center">
          {[{ color: "bg-slate-500/40", label: "Current" }, { color: "bg-violet-500/60", label: "Optimized" }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={cn("h-2.5 w-2.5 rounded-sm", color)} aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────
function RecommendationCard({ rec }: { rec: AuditRecommendation }) {
  const hasSavings = rec.monthlySavings > 0;
  const badgeVariant = rec.priority === "high" ? "danger" : rec.priority === "medium" ? "warning" : rec.priority === "none" ? "success" : "info";
  const borderColor = rec.priority === "high" ? "border-red-500/20" : rec.priority === "medium" ? "border-yellow-500/20" : rec.priority === "none" ? "border-emerald-500/20" : "border-blue-500/20";

  return (
    <Card hover className={cn("transition-all duration-300", borderColor)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-lg shrink-0",
              hasSavings ? "bg-white/8" : "bg-emerald-500/10"
            )} aria-hidden="true">
              {hasSavings ? (rec.priority === "high" ? "⚠️" : "💡") : "✅"}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{rec.tool}</h3>
              <p className="text-xs text-slate-500">
                {rec.currentPlan}
                {rec.recommendedPlan && rec.recommendedPlan !== rec.currentPlan && (
                  <> <span aria-hidden="true">→</span> <span className="text-violet-400">{rec.recommendedPlan}</span></>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={badgeVariant}>{getPriorityLabel(rec.priority)}</Badge>
            {hasSavings && (
              <span className="text-xs text-slate-500 font-mono-numbers">Save {formatPercent(rec.savingsPercent)}</span>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mb-3">{rec.reason}</p>

        {/* Confidence */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-600">Confidence</span>
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[80px]">
            <div className="h-full bg-violet-500/60 rounded-full" style={{ width: `${rec.confidenceScore}%` }} aria-label={`${rec.confidenceScore}% confidence`} />
          </div>
          <span className="text-xs text-slate-600 font-mono-numbers">{rec.confidenceScore}%</span>
        </div>

        {hasSavings && (
          <div className="rounded-lg bg-white/4 border border-white/8 p-3 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-0.5">Current</p>
              <p className="text-sm font-semibold text-white font-mono-numbers">
                {formatCurrency(rec.currentMonthlySpend)}<span className="text-slate-500 text-xs font-normal">/mo</span>
              </p>
            </div>
            <div className="flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-0.5">Optimized</p>
              <p className="text-sm font-semibold text-emerald-400 font-mono-numbers">
                {formatCurrency(rec.optimizedMonthlySpend)}<span className="text-emerald-600 text-xs font-normal">/mo</span>
              </p>
            </div>
            <div className="col-span-3 border-t border-white/8 pt-2 mt-1 flex justify-between">
              <div>
                <p className="text-xs text-slate-500">Monthly savings</p>
                <p className="text-sm font-bold text-emerald-400 font-mono-numbers">+{formatCurrency(rec.monthlySavings)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Annual savings</p>
                <p className="text-sm font-bold text-emerald-300 font-mono-numbers">+{formatCurrency(rec.yearlySavings)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 mb-6">
        <RotateCcw className="h-8 w-8 text-slate-500" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">No audit data found</h2>
      <p className="text-slate-400 mb-8 max-w-sm">Add your AI tools in the audit form to see your personalized savings analysis.</p>
      <Link href="/audit">
        <Button size="lg">Start Your Audit <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
      </Link>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { tools, isLoaded, clearTools } = useAuditStore();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [reportUrl, setReportUrl] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const auditResult: AuditResult | null = useMemo(() => {
    if (!isLoaded || tools.length === 0) return null;
    return runAudit(tools);
  }, [tools, isLoaded]);

  const sortedRecs = useMemo(() => {
    if (!auditResult) return [];
    const order = { high: 0, medium: 1, low: 2, none: 3 };
    return [...auditResult.recommendations].sort((a, b) => {
      const d = order[a.priority] - order[b.priority];
      return d !== 0 ? d : b.yearlySavings - a.yearlySavings;
    });
  }, [auditResult]);

  const highPriorityCount = sortedRecs.filter((r) => r.priority === "high").length;
  const optimizedCount = sortedRecs.filter((r) => r.priority === "none").length;

  const onSaveReport = async (data: LeadFormData) => {
    if (!auditResult) return;
    setIsSaving(true);
    setSaveError("");
    try {
      // Save to Supabase
      const { auditId } = await saveLeadAndAudit(data, auditResult, auditResult.totalYearlySavings);
      
      const shareUrl = `${window.location.origin}/results/${auditId}`;
      setReportUrl(shareUrl);
      
      // Get AI summary (we can generate it synchronously or fetch from state)
      const aiSummaryResponse = await generateAuditSummary(auditResult);

      // Send Email
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          reportUrl: shareUrl,
          totalMonthlySavings: auditResult.totalMonthlySavings,
          totalYearlySavings: auditResult.totalYearlySavings,
          aiSummary: aiSummaryResponse.text,
        }),
      });

      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err.message || "Something went wrong saving your report.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 space-y-4" aria-label="Loading audit results">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!auditResult) return <EmptyState />;

  const hasSavings = auditResult.totalMonthlySavings > 0;

  return (
    <div className="relative py-12 px-4 sm:px-6 min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <Link href="/audit" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Audit Form
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge variant="info" className="mb-3">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Audit Complete
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Your Savings Report</h1>
              <p className="text-slate-400 mt-2 text-sm">
                {tools.length} tool{tools.length !== 1 ? "s" : ""} analyzed ·{" "}
                {new Date(auditResult.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowConfirmClear(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
            </Button>
          </div>
        </div>

        {/* Confirm reset dialog */}
        {showConfirmClear && (
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-clear-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="max-w-sm w-full border-red-500/20">
              <CardContent className="p-6 text-center">
                <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" aria-hidden="true" />
                <h2 id="confirm-clear-title" className="font-semibold text-white mb-2">Reset Audit Data?</h2>
                <p className="text-sm text-slate-400 mb-5">This clears all tools and results. This cannot be undone.</p>
                <div className="flex gap-3">
                  <Button variant="destructive" size="sm" className="flex-1"
                    onClick={() => { clearTools(); setShowConfirmClear(false); }}>Yes, Reset</Button>
                  <Button variant="secondary" size="sm" className="flex-1"
                    onClick={() => setShowConfirmClear(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lead Capture Modal */}
        {showLeadCapture && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <Card className="max-w-md w-full border-violet-500/20 shadow-2xl relative my-8">
              <button 
                onClick={() => setShowLeadCapture(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <XCircle className="h-5 w-5" />
              </button>
              <CardContent className="p-6 sm:p-8">
                {saveSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 mb-2">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Report Saved & Sent!</h2>
                    <p className="text-sm text-slate-400">
                      We've emailed your savings summary. You can also access your public report below.
                    </p>
                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 break-all text-xs text-slate-300 select-all">
                      {reportUrl}
                    </div>
                    <Button className="w-full mt-4" onClick={() => setShowLeadCapture(false)}>
                      Close
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white mb-2">Save Your Savings Report</h2>
                    <p className="text-sm text-slate-400 mb-6">
                      Get a permanent link to your audit and an AI summary sent straight to your inbox.
                    </p>
                    <form onSubmit={handleSubmit(onSaveReport)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                        <Input placeholder="you@company.com" {...register("email")} />
                        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Company Name (Optional)</label>
                        <Input placeholder="Acme Inc." {...register("company_name")} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Your Role</label>
                          <Input placeholder="Founder, CTO..." {...register("role")} />
                          {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Team Size</label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                            {...register("team_size")}
                          >
                            <option value="" disabled className="bg-slate-900">Select...</option>
                            <option value="1-10" className="bg-slate-900">1-10</option>
                            <option value="11-50" className="bg-slate-900">11-50</option>
                            <option value="51-200" className="bg-slate-900">51-200</option>
                            <option value="200+" className="bg-slate-900">200+</option>
                          </select>
                          {errors.team_size && <p className="text-xs text-red-400 mt-1">{errors.team_size.message}</p>}
                        </div>
                      </div>
                      {saveError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-400">
                          {saveError}
                        </div>
                      )}
                      <Button type="submit" className="w-full mt-2" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Report"}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Monthly Savings" value="" animate={auditResult.totalMonthlySavings}
            subtext="per month" highlight={hasSavings}
            icon={<TrendingDown className="h-5 w-5 text-violet-400" aria-hidden="true" />} />
          <MetricCard label="Annual Savings" value="" animate={auditResult.totalYearlySavings}
            subtext="per year"
            icon={<Trophy className="h-5 w-5 text-yellow-400" aria-hidden="true" />} />
          <MetricCard label="Current Spend" value={formatCurrency(auditResult.totalMonthlySpend)} subtext="monthly total" />
          <MetricCard label="Savings Rate" value={formatPercent(auditResult.overallSavingsPercent)} subtext="of total spend" />
        </div>

        {/* Status banner */}
        <div className={cn("rounded-xl border p-4 mb-8 flex items-start gap-3",
          hasSavings ? "border-yellow-500/20 bg-yellow-500/5" : "border-emerald-500/20 bg-emerald-500/5"
        )} role="status">
          {hasSavings
            ? <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />
            : <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />}
          <div>
            {hasSavings ? (
              <>
                <p className="font-medium text-white text-sm">
                  We found <span className="text-emerald-400 font-mono-numbers">{formatCurrency(auditResult.totalYearlySavings)}</span> in potential annual savings
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {highPriorityCount > 0
                    ? `${highPriorityCount} high-priority optimization${highPriorityCount > 1 ? "s" : ""} — act on these first.`
                    : "Review the recommendations below."}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-white text-sm">Your AI stack looks well-optimized! 🎉</p>
                <p className="text-xs text-slate-400 mt-0.5">No significant savings opportunities at current pricing and team size.</p>
              </>
            )}
          </div>
        </div>

        {/* AI Summary */}
        <AISummaryBox result={auditResult} />

        {/* Savings Chart */}
        <SavingsChart recs={sortedRecs} />

        {/* Recommendations */}
        <section aria-labelledby="recs-heading">
          <div className="flex items-center justify-between mb-5">
            <h2 id="recs-heading" className="text-lg font-semibold text-white">Per-Tool Recommendations</h2>
            <div className="flex gap-3 text-xs text-slate-500">
              {highPriorityCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden="true" /> {highPriorityCount} high
                </span>
              )}
              {optimizedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" /> {optimizedCount} optimized
                </span>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {sortedRecs.map((rec) => <RecommendationCard key={rec.toolId} rec={rec} />)}
          </div>
        </section>

        {/* Credex CTA for high savings */}
        {auditResult.totalMonthlySavings >= 200 && (
          <Card gradient className="mt-8 border-violet-500/20">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shrink-0">
                <Zap className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">Want help implementing these savings?</p>
                <p className="text-sm text-slate-400 mb-3">
                  Credex can implement your top optimizations — contract renegotiation, plan migrations, and spend monitoring — in under a week.
                </p>
                <Button size="sm">
                  Book a Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link href="/audit">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Edit Tools
            </Button>
          </Link>
          <Button onClick={() => setShowLeadCapture(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
            Save this report <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
