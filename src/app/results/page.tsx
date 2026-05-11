"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RotateCcw,
  Download,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAuditStore } from "@/hooks/useAuditStore";
import { runAudit, getPriorityLabel, getPriorityColor } from "@/lib/auditEngine";
import { AuditResult, AuditRecommendation } from "@/types/audit";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

// ─── Saving Metric Card ───────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

function MetricCard({ label, value, subtext, highlight, icon }: MetricCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        highlight && "border-violet-500/40 bg-gradient-to-br from-violet-500/10 to-indigo-500/5"
      )}
    >
      <CardContent className="p-6">
        {icon && (
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
            {icon}
          </div>
        )}
        <p className="text-sm text-slate-400 mb-1">{label}</p>
        <p
          className={cn(
            "text-3xl font-bold font-mono-numbers",
            highlight ? "gradient-text" : "text-white"
          )}
        >
          {value}
        </p>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────

function RecommendationCard({ rec }: { rec: AuditRecommendation }) {
  const hasSavings = rec.monthlySavings > 0;
  const priorityLabel = getPriorityLabel(rec.priority);
  const priorityColor = getPriorityColor(rec.priority);

  const badgeVariant =
    rec.priority === "high"
      ? "danger"
      : rec.priority === "medium"
      ? "warning"
      : rec.priority === "none"
      ? "success"
      : "info";

  const borderColor =
    rec.priority === "high"
      ? "border-red-500/20"
      : rec.priority === "medium"
      ? "border-yellow-500/20"
      : rec.priority === "none"
      ? "border-emerald-500/20"
      : "border-blue-500/20";

  return (
    <Card
      hover
      className={cn("transition-all duration-300 animate-fade-in-up", borderColor)}
    >
      <CardContent className="p-6">
        {/* Tool header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl text-lg shrink-0",
                hasSavings ? "bg-white/8" : "bg-emerald-500/10"
              )}
              aria-hidden="true"
            >
              {hasSavings ? (
                rec.priority === "high" ? "⚠️" : "💡"
              ) : (
                "✅"
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{rec.tool}</h3>
              <p className="text-xs text-slate-500">
                {rec.currentPlan}
                {rec.recommendedPlan && rec.recommendedPlan !== rec.currentPlan && (
                  <>
                    {" "}
                    <span aria-hidden="true">→</span>{" "}
                    <span className="text-violet-400">{rec.recommendedPlan}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge variant={badgeVariant}>{priorityLabel}</Badge>
            {hasSavings && (
              <span className="text-xs text-slate-500 font-mono-numbers">
                Save {formatPercent(rec.savingsPercent)}
              </span>
            )}
          </div>
        </div>

        {/* Reason */}
        <p className="text-sm text-slate-400 leading-relaxed mb-4">{rec.reason}</p>

        {/* Savings breakdown */}
        {hasSavings && (
          <div className="rounded-lg bg-white/4 border border-white/8 p-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Current</p>
              <p className="text-sm font-semibold text-white font-mono-numbers">
                {formatCurrency(rec.currentMonthlySpend)}<span className="text-slate-500 font-normal text-xs">/mo</span>
              </p>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              <TrendingDown className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Optimized</p>
              <p className="text-sm font-semibold text-emerald-400 font-mono-numbers">
                {formatCurrency(rec.optimizedMonthlySpend)}<span className="text-emerald-600 font-normal text-xs">/mo</span>
              </p>
            </div>
            <div className="col-span-3 border-t border-white/8 pt-3 mt-1 flex justify-between items-center">
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
      <p className="text-slate-400 mb-8 max-w-sm">
        Head to the audit form and add your AI tools to see your savings analysis.
      </p>
      <Link href="/audit">
        <Button size="lg">
          Start Your Audit
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { tools, isLoaded, clearTools } = useAuditStore();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Run the audit engine on loaded tools
  const auditResult: AuditResult | null = useMemo(() => {
    if (!isLoaded || tools.length === 0) return null;
    return runAudit(tools);
  }, [tools, isLoaded]);

  // Sort recommendations: high priority first, then by savings desc
  const sortedRecs = useMemo(() => {
    if (!auditResult) return [];
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
    return [...auditResult.recommendations].sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.yearlySavings - a.yearlySavings;
    });
  }, [auditResult]);

  const highPriorityCount = sortedRecs.filter((r) => r.priority === "high").length;
  const optimizedCount = sortedRecs.filter((r) => r.priority === "none").length;

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 space-y-4" aria-label="Loading audit results…">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!auditResult) {
    return <EmptyState />;
  }

  const hasSavings = auditResult.totalMonthlySavings > 0;

  return (
    <div className="relative py-12 px-4 sm:px-6 min-h-screen">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-10">
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Audit Form
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge variant="info" className="mb-3">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Audit Complete
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Your Savings Report
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                Analyzed {tools.length} tool{tools.length !== 1 ? "s" : ""} ·{" "}
                {new Date(auditResult.generatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmClear(true)}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Confirm clear modal */}
        {showConfirmClear && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-clear-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <Card className="max-w-sm w-full border-red-500/20">
              <CardContent className="p-6 text-center">
                <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" aria-hidden="true" />
                <h2 id="confirm-clear-title" className="font-semibold text-white mb-2">
                  Reset Audit Data?
                </h2>
                <p className="text-sm text-slate-400 mb-5">
                  This will clear all your added tools and saved audit results. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      clearTools();
                      setShowConfirmClear(false);
                    }}
                  >
                    Yes, Reset
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowConfirmClear(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Monthly Savings"
            value={formatCurrency(auditResult.totalMonthlySavings)}
            subtext="per month"
            highlight={hasSavings}
            icon={<TrendingDown className="h-5 w-5 text-violet-400" aria-hidden="true" />}
          />
          <MetricCard
            label="Annual Savings"
            value={formatCurrency(auditResult.totalYearlySavings)}
            subtext="per year"
            icon={<Trophy className="h-5 w-5 text-yellow-400" aria-hidden="true" />}
          />
          <MetricCard
            label="Current Spend"
            value={formatCurrency(auditResult.totalMonthlySpend)}
            subtext="monthly total"
          />
          <MetricCard
            label="Savings Rate"
            value={formatPercent(auditResult.overallSavingsPercent)}
            subtext="of total spend"
          />
        </div>

        {/* Status banner */}
        <div
          className={cn(
            "rounded-xl border p-4 mb-8 flex items-start gap-3",
            hasSavings
              ? "border-yellow-500/20 bg-yellow-500/5"
              : "border-emerald-500/20 bg-emerald-500/5"
          )}
          role="status"
        >
          {hasSavings ? (
            <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div>
            {hasSavings ? (
              <>
                <p className="font-medium text-white text-sm">
                  We found{" "}
                  <span className="text-emerald-400 font-mono-numbers">
                    {formatCurrency(auditResult.totalYearlySavings)}
                  </span>{" "}
                  in potential annual savings
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {highPriorityCount > 0
                    ? `${highPriorityCount} high-priority optimization${highPriorityCount > 1 ? "s" : ""} found. Act on these first.`
                    : "Review the recommendations below to start saving."}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-white text-sm">
                  Your AI stack looks well-optimized! 🎉
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Based on current pricing and your team size, we didn&apos;t find significant savings opportunities.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Tool Recommendations */}
        <section aria-labelledby="recs-heading">
          <div className="flex items-center justify-between mb-5">
            <h2 id="recs-heading" className="text-lg font-semibold text-white">
              Tool Recommendations
            </h2>
            <div className="flex gap-2 text-xs text-slate-500">
              {highPriorityCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400 inline-block" aria-hidden="true" />
                  {highPriorityCount} high
                </span>
              )}
              {optimizedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
                  {optimizedCount} optimized
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {sortedRecs.map((rec) => (
              <RecommendationCard key={rec.toolId} rec={rec} />
            ))}
          </div>
        </section>

        {/* Action footer */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link href="/audit">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Edit Tools
            </Button>
          </Link>
          <div className="flex gap-3">
            <p className="text-xs text-slate-600 self-center hidden sm:block">
              Results saved locally in your browser
            </p>
            <Link href="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
