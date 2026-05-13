import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, TrendingDown, CheckCircle2, AlertTriangle, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { getPriorityLabel } from "@/lib/auditEngine";
import { AuditRecommendation } from "@/types/audit";

// Re-use components or implement simplified versions
function MetricCard({ label, value, subtext, highlight, icon }: {
  label: string; value: string; subtext?: string; highlight?: boolean; icon?: React.ReactNode;
}) {
  return (
    <Card className={cn("transition-all duration-300", highlight && "border-violet-500/40 bg-gradient-to-br from-violet-500/10 to-indigo-500/5")}>
      <CardContent className="p-5">
        {icon && <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">{icon}</div>}
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className={cn("text-2xl font-bold", highlight ? "gradient-text" : "text-white")}>{value}</p>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ rec }: { rec: AuditRecommendation }) {
  const hasSavings = rec.monthlySavings > 0;
  const badgeVariant = rec.priority === "high" ? "danger" : rec.priority === "medium" ? "warning" : rec.priority === "none" ? "success" : "info";
  const borderColor = rec.priority === "high" ? "border-red-500/20" : rec.priority === "medium" ? "border-yellow-500/20" : rec.priority === "none" ? "border-emerald-500/20" : "border-blue-500/20";

  return (
    <Card className={cn(borderColor)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-lg shrink-0", hasSavings ? "bg-white/8" : "bg-emerald-500/10")} aria-hidden="true">
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
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed mb-3">{rec.reason}</p>
        {hasSavings && (
          <div className="rounded-lg bg-white/4 border border-white/8 p-3 flex justify-between items-center mt-2">
             <div>
                <p className="text-xs text-slate-500">Monthly savings</p>
                <p className="text-sm font-bold text-emerald-400 font-mono-numbers">+{formatCurrency(rec.monthlySavings)}</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-slate-500">Annual savings</p>
                <p className="text-sm font-bold text-emerald-300 font-mono-numbers">+{formatCurrency(rec.yearlySavings)}</p>
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  if (!id.startsWith("demo-id-")) {
    const { data: auditData } = await supabase
      .from("audits")
      .select("total_savings")
      .eq("id", id)
      .single();

    if (auditData) {
      const formattedSavings = formatCurrency(auditData.total_savings);
      return {
        title: `This startup could save ${formattedSavings}/year on AI tools | Credex AI`,
        description: `View this customized AI spend audit report and see how much startups can save by optimizing their AI tool stack.`,
        openGraph: {
          title: `This startup could save ${formattedSavings}/year on AI tools`,
          description: "See the exact optimizations and savings breakdown in this AI Spend Audit.",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `This startup could save ${formattedSavings}/year on AI tools`,
          description: "View the AI Spend Audit.",
        },
      };
    }
  }

  return {
    title: "AI Spend Audit Report | Credex AI",
    description: "View this customized AI spend audit report.",
  };
}

export default async function PublicReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auditResult = null;

  if (id.startsWith("demo-id-")) {
    // Return dummy data or 404 for missing demo
    // In real app, we might handle demo mode
    notFound();
  } else {
    const { data, error } = await supabase
      .from("audits")
      .select("audit_data")
      .eq("id", id)
      .single();
    
    if (error || !data) {
      notFound();
    }
    
    auditResult = data.audit_data;
  }

  if (!auditResult) notFound();

  const sortedRecs: AuditRecommendation[] = [...auditResult.recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2, none: 3 };
    const d = order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
    return d !== 0 ? d : b.yearlySavings - a.yearlySavings;
  });

  const hasSavings = auditResult.totalMonthlySavings > 0;

  return (
    <div className="relative py-12 px-4 sm:px-6 min-h-screen">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <Badge variant="info" className="mb-3">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Verified Audit Report
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Startup AI Savings Analysis</h1>
          <p className="text-slate-400 mt-2 text-sm">
            This startup ran an AI spend audit and found {formatCurrency(auditResult.totalYearlySavings)} in potential savings.
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Monthly Savings" value={formatCurrency(auditResult.totalMonthlySavings)}
            subtext="per month" highlight={hasSavings}
            icon={<TrendingDown className="h-5 w-5 text-violet-400" aria-hidden="true" />} />
          <MetricCard label="Annual Savings" value={formatCurrency(auditResult.totalYearlySavings)}
            subtext="per year"
            icon={<Trophy className="h-5 w-5 text-yellow-400" aria-hidden="true" />} />
          <MetricCard label="Current Spend" value={formatCurrency(auditResult.totalMonthlySpend)} subtext="monthly total" />
          <MetricCard label="Savings Rate" value={formatPercent(auditResult.overallSavingsPercent)} subtext="of total spend" />
        </div>

        {/* Recommendations */}
        <section aria-labelledby="recs-heading" className="mb-12">
          <h2 id="recs-heading" className="text-lg font-semibold text-white mb-5">Per-Tool Recommendations</h2>
          <div className="space-y-4">
            {sortedRecs.map((rec) => <RecommendationCard key={rec.toolId} rec={rec} />)}
          </div>
        </section>

        {/* Call to Action */}
        <Card className="border-violet-500/40 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 text-center p-8">
          <h3 className="text-2xl font-bold text-white mb-3">Want to find your own savings?</h3>
          <p className="text-slate-400 mb-6">
            Run a free audit on your AI stack and see exactly how much you could save with optimization.
          </p>
          <Link href="/audit">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white">
              Run Free Audit <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
