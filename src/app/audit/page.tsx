"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ChevronUp, Sparkles, ArrowRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuditStore } from "@/hooks/useAuditStore";
import { getPlansForTool } from "@/lib/auditEngine";
import { AITool, AIPlan, UseCase } from "@/types/audit";
import { cn, formatCurrency } from "@/lib/utils";

// ─── Validation Schema ────────────────────────────────────────────────────

const AI_TOOL_VALUES = [
  "ChatGPT", "Claude", "Cursor", "GitHub Copilot",
  "Gemini", "OpenAI API", "Anthropic API", "Windsurf",
] as const;

const USE_CASE_VALUES = ["coding", "writing", "research", "data", "mixed"] as const;

const toolSchema = z.object({
  tool: z.enum(AI_TOOL_VALUES, { message: "Please select an AI tool" }),
  plan: z.string().min(1, "Please select a plan"),
  monthlySpend: z
    .number({ message: "Enter a valid number" })
    .min(0, "Cannot be negative")
    .max(100000, "Enter a realistic spend"),
  seats: z
    .number({ message: "Enter a valid number" })
    .int("Must be a whole number")
    .min(1, "Minimum 1 seat")
    .max(10000, "Max 10,000 seats"),
  teamSize: z
    .number({ message: "Enter a valid number" })
    .int("Must be a whole number")
    .min(1, "Minimum 1")
    .max(100000, "Max 100,000"),
  useCase: z.enum(USE_CASE_VALUES, { message: "Please select a use case" }),
});

type ToolFormData = z.infer<typeof toolSchema>;

// ─── Constants ────────────────────────────────────────────────────────────

const AI_TOOLS: AITool[] = [
  "ChatGPT", "Claude", "Cursor", "GitHub Copilot",
  "Gemini", "OpenAI API", "Anthropic API", "Windsurf",
];

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding",   label: "💻 Coding / Development" },
  { value: "writing",  label: "✍️ Writing / Content" },
  { value: "research", label: "🔍 Research / Analysis" },
  { value: "data",     label: "📊 Data Processing" },
  { value: "mixed",    label: "🔀 Mixed / General" },
];

const TOOL_META: Record<AITool, { color: string; icon: string; company: string }> = {
  "ChatGPT":       { color: "border-emerald-500/30 bg-emerald-500/5",  icon: "🤖", company: "OpenAI" },
  "Claude":        { color: "border-orange-500/30 bg-orange-500/5",    icon: "🌊", company: "Anthropic" },
  "Cursor":        { color: "border-violet-500/30 bg-violet-500/5",    icon: "⚡", company: "Anysphere" },
  "GitHub Copilot":{ color: "border-slate-500/30 bg-slate-500/5",      icon: "🐙", company: "GitHub" },
  "Gemini":        { color: "border-blue-500/30 bg-blue-500/5",        icon: "✨", company: "Google" },
  "OpenAI API":    { color: "border-teal-500/30 bg-teal-500/5",        icon: "🔌", company: "OpenAI" },
  "Anthropic API": { color: "border-amber-500/30 bg-amber-500/5",      icon: "🧠", company: "Anthropic" },
  "Windsurf":      { color: "border-cyan-500/30 bg-cyan-500/5",        icon: "🏄", company: "Codeium" },
};

// ─── Tool Card ────────────────────────────────────────────────────────────

interface ToolCardProps {
  toolId: string;
  tool: AITool;
  plan: string;
  monthlySpend: number;
  seats: number;
  teamSize: number;
  useCase: string;
  onRemove: (id: string) => void;
}

function ToolCard({ toolId, tool, plan, monthlySpend, seats, teamSize, useCase, onRemove }: ToolCardProps) {
  const meta = TOOL_META[tool] ?? { color: "border-white/10 bg-white/5", icon: "🛠️", company: "" };
  const useCaseLabel = USE_CASES.find((u) => u.value === useCase)?.label ?? useCase;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-300 animate-fade-in-up",
        meta.color
      )}
      role="article"
      aria-label={`${tool} tool entry — $${monthlySpend}/month`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">{meta.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">{tool}</span>
              <Badge variant="info" className="text-xs">{plan}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{seats} seat{seats !== 1 ? "s" : ""}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden="true" />
                {teamSize} total
              </span>
              <span aria-hidden="true">·</span>
              <span>{useCaseLabel.replace(/^.+?\s/, "")}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="text-sm font-semibold text-white font-mono-numbers">
            {formatCurrency(monthlySpend)}
            <span className="text-slate-500 font-normal text-xs">/mo</span>
          </p>
          <button
            onClick={() => onRemove(toolId)}
            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label={`Remove ${tool} from audit`}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Tool Form ────────────────────────────────────────────────────────

interface AddToolFormProps {
  onAdd: (data: ToolFormData) => void;
}

function AddToolForm({ onAdd }: AddToolFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AITool | "">("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: { seats: 1, teamSize: 1, monthlySpend: 0 },
  });

  const watchedTool = watch("tool");

  useEffect(() => {
    if (watchedTool) {
      setValue("plan", "" as AIPlan);
      setSelectedTool(watchedTool);
    }
  }, [watchedTool, setValue]);

  const planOptions = selectedTool
    ? getPlansForTool(selectedTool).map((p) => ({ value: p, label: p }))
    : [];

  const close = () => { setIsOpen(false); reset(); setSelectedTool(""); };

  const onSubmit = (data: ToolFormData) => {
    onAdd(data);
    close();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl border border-dashed border-white/15 py-4 px-5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-200 group"
        aria-expanded="false"
        aria-label="Add a new AI tool to the audit"
        type="button"
      >
        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
        Add AI Tool
      </button>
    );
  }

  return (
    <Card className="border-violet-500/30 bg-violet-500/5" id="add-tool-form">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Add AI Tool</CardTitle>
          <button
            onClick={close}
            className="text-slate-500 hover:text-white transition-colors"
            aria-label="Cancel"
            type="button"
          >
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Add AI tool form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Tool */}
            <Select
              id="tool"
              label="AI Tool *"
              placeholder="Select tool…"
              options={AI_TOOLS.map((t) => ({ value: t, label: `${TOOL_META[t].icon} ${t}` }))}
              error={errors.tool?.message}
              aria-required="true"
              {...register("tool")}
            />

            {/* Plan */}
            <Select
              id="plan"
              label="Current Plan *"
              placeholder={selectedTool ? "Select plan…" : "Select tool first"}
              options={planOptions}
              error={errors.plan?.message}
              disabled={!selectedTool}
              aria-required="true"
              {...register("plan")}
            />

            {/* Monthly Spend */}
            <Input
              id="monthlySpend"
              label="Monthly Spend (USD) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 50"
              error={errors.monthlySpend?.message}
              aria-required="true"
              {...register("monthlySpend", { valueAsNumber: true })}
            />

            {/* Seats */}
            <Input
              id="seats"
              label="Number of Seats / Licenses *"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 3"
              error={errors.seats?.message}
              aria-required="true"
              {...register("seats", { valueAsNumber: true })}
            />

            {/* Team Size */}
            <Input
              id="teamSize"
              label="Total Team Size *"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 10"
              error={errors.teamSize?.message}
              aria-required="true"
              {...register("teamSize", { valueAsNumber: true })}
            />

            {/* Use Case */}
            <Select
              id="useCase"
              label="Primary Use Case *"
              placeholder="Select use case…"
              options={USE_CASES}
              error={errors.useCase?.message}
              aria-required="true"
              {...register("useCase")}
            />

          </div>

          <div className="mt-5 flex gap-3">
            <Button type="submit" size="sm" loading={isSubmitting}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Tool
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Main Audit Page ──────────────────────────────────────────────────────

export default function AuditPage() {
  const router = useRouter();
  const { tools, isLoaded, addTool, removeTool, clearTools } = useAuditStore();
  const [isRunning, setIsRunning] = useState(false);

  const totalMonthlySpend = tools.reduce((s, t) => s + t.monthlySpend, 0);
  const totalSeats = tools.reduce((s, t) => s + t.seats, 0);

  const handleRunAudit = async () => {
    if (tools.length === 0) return;
    setIsRunning(true);
    await new Promise((r) => setTimeout(r, 700));
    router.push("/results");
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="info" className="mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Step 1 of 2 — Add Tools
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Add your AI tools
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Enter each AI tool your team pays for. Add all tools for the most
            accurate savings analysis.
          </p>
        </div>

        {/* Summary bar */}
        {tools.length > 0 && (
          <div
            className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4 flex-wrap"
            role="region"
            aria-label="Audit summary"
          >
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: "Tools", value: tools.length.toString() },
                { label: "Total seats", value: totalSeats.toString() },
                { label: "Monthly spend", value: formatCurrency(totalMonthlySpend) },
                { label: "Annual spend", value: formatCurrency(totalMonthlySpend * 12) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-semibold text-white font-mono-numbers">{value}</p>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={clearTools} className="text-slate-500 hover:text-red-400">
              Clear all
            </Button>
          </div>
        )}

        {/* Tool list */}
        <div className="space-y-3 mb-4" role="list" aria-label="Added AI tools">
          {!isLoaded ? (
            <div className="space-y-3" aria-label="Loading saved tools">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-white/10 p-4 flex gap-3 items-center">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : tools.length === 0 ? (
            <div
              className="rounded-xl border border-dashed border-white/10 py-12 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-3xl mb-3" aria-hidden="true">🔍</p>
              <p className="text-slate-400 text-sm font-medium">No tools added yet</p>
              <p className="text-slate-600 text-xs mt-1">Add your first AI tool below to start the audit ↓</p>
            </div>
          ) : (
            tools.map((tool) => (
              <ToolCard
                key={tool.id}
                toolId={tool.id}
                tool={tool.tool}
                plan={tool.plan}
                monthlySpend={tool.monthlySpend}
                seats={tool.seats}
                teamSize={tool.teamSize}
                useCase={tool.useCase}
                onRemove={removeTool}
              />
            ))
          )}
        </div>

        {/* Add tool form */}
        <AddToolForm
          onAdd={(data) =>
            addTool({ ...data, plan: data.plan as AIPlan })
          }
        />

        {/* Run audit CTA */}
        {tools.length > 0 && (
          <div className="mt-8 space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={handleRunAudit}
              loading={isRunning}
              disabled={isRunning}
              id="run-audit-btn"
              aria-label={`Run audit on ${tools.length} tool${tools.length !== 1 ? "s" : ""}`}
            >
              {isRunning ? "Analyzing your AI stack…" : `Run Audit on ${tools.length} Tool${tools.length !== 1 ? "s" : ""}`}
              {!isRunning && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </Button>
            <p className="text-center text-xs text-slate-600">
              All calculations are instant and private — nothing leaves your browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
