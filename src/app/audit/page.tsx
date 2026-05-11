"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuditStore } from "@/hooks/useAuditStore";
import { getPlansForTool } from "@/lib/auditEngine";
import { AITool, AIPlan, UseCase } from "@/types/audit";
import { cn } from "@/lib/utils";

// ─── Form Validation Schema ───────────────────────────────────────────────

const toolSchema = z.object({
  tool: z.enum(["ChatGPT", "Claude", "Cursor", "GitHub Copilot", "Gemini", "OpenAI API"] as const, {
    message: "Please select an AI tool",
  }),
  plan: z.string().min(1, "Please select a plan"),
  monthlySpend: z
    .number({ message: "Enter a valid number" })
    .min(0, "Spend cannot be negative")
    .max(100000, "Enter a realistic monthly spend"),
  seats: z
    .number({ message: "Enter a valid number" })
    .int("Seats must be a whole number")
    .min(1, "Minimum 1 seat")
    .max(10000, "Enter a realistic seat count"),
  useCase: z.enum(
    ["Coding", "Writing", "Research", "Customer Support", "Data Analysis", "General Productivity", "Other"] as const,
    { message: "Please select a use case" }
  ),
});

type ToolFormData = z.infer<typeof toolSchema>;

// ─── Constants ────────────────────────────────────────────────────────────

const AI_TOOLS: AITool[] = [
  "ChatGPT", "Claude", "Cursor", "GitHub Copilot", "Gemini", "OpenAI API",
];

const USE_CASES: UseCase[] = [
  "Coding", "Writing", "Research", "Customer Support", "Data Analysis", "General Productivity", "Other",
];

const TOOL_COLORS: Record<AITool, string> = {
  "ChatGPT": "border-emerald-500/30 bg-emerald-500/5",
  "Claude": "border-orange-500/30 bg-orange-500/5",
  "Cursor": "border-violet-500/30 bg-violet-500/5",
  "GitHub Copilot": "border-slate-500/30 bg-slate-500/5",
  "Gemini": "border-blue-500/30 bg-blue-500/5",
  "OpenAI API": "border-teal-500/30 bg-teal-500/5",
};

const TOOL_ICONS: Record<AITool, string> = {
  "ChatGPT": "🤖",
  "Claude": "🌊",
  "Cursor": "⚡",
  "GitHub Copilot": "🐙",
  "Gemini": "✨",
  "OpenAI API": "🔌",
};

// ─── Tool Card Component ──────────────────────────────────────────────────

interface ToolCardProps {
  toolId: string;
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  useCase: string;
  onRemove: (id: string) => void;
  index: number;
}

function ToolCard({ toolId, tool, plan, monthlySpend, seats, useCase, onRemove, index }: ToolCardProps) {
  const toolKey = tool as AITool;
  const colorClass = TOOL_COLORS[toolKey] ?? "border-white/10 bg-white/5";
  const icon = TOOL_ICONS[toolKey] ?? "🛠️";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-300 animate-fade-in-up",
        colorClass
      )}
      role="article"
      aria-label={`${tool} tool entry`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">{icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-sm">{tool}</h3>
              <Badge variant="info" className="text-xs">{plan}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {seats} seat{seats !== 1 ? "s" : ""} · {useCase}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="text-sm font-semibold text-white font-mono-numbers">
            ${monthlySpend.toFixed(0)}<span className="text-slate-500 font-normal text-xs">/mo</span>
          </p>
          <button
            onClick={() => onRemove(toolId)}
            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label={`Remove ${tool} from audit`}
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
    defaultValues: {
      seats: 1,
      monthlySpend: 0,
    },
  });

  const watchedTool = watch("tool");

  // Reset plan when tool changes
  useEffect(() => {
    if (watchedTool) {
      setValue("plan", "" as AIPlan);
      setSelectedTool(watchedTool);
    }
  }, [watchedTool, setValue]);

  const planOptions = selectedTool
    ? getPlansForTool(selectedTool).map((p) => ({ value: p, label: p }))
    : [];

  const onSubmit = (data: ToolFormData) => {
    onAdd(data);
    reset();
    setSelectedTool("");
    setIsOpen(false);
  };

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-xl border border-dashed border-white/15 py-4 px-5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-200 group"
          aria-expanded={isOpen}
          aria-controls="add-tool-form"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
          Add AI Tool
        </button>
      ) : (
        <Card id="add-tool-form" className="border-violet-500/30 bg-violet-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Add AI Tool</CardTitle>
              <button
                onClick={() => { setIsOpen(false); reset(); setSelectedTool(""); }}
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Cancel adding tool"
              >
                <ChevronUp className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              aria-label="Add AI tool form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tool */}
                <Select
                  id="tool"
                  label="AI Tool *"
                  placeholder="Select tool…"
                  options={AI_TOOLS.map((t) => ({ value: t, label: t }))}
                  error={errors.tool?.message}
                  {...register("tool")}
                  aria-required="true"
                />

                {/* Plan */}
                <Select
                  id="plan"
                  label="Current Plan *"
                  placeholder={selectedTool ? "Select plan…" : "Select tool first"}
                  options={planOptions}
                  error={errors.plan?.message}
                  disabled={!selectedTool}
                  {...register("plan")}
                  aria-required="true"
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
                  label="Number of Seats / Users *"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 3"
                  error={errors.seats?.message}
                  aria-required="true"
                  {...register("seats", { valueAsNumber: true })}
                />

                {/* Use Case */}
                <div className="sm:col-span-2">
                  <Select
                    id="useCase"
                    label="Primary Use Case *"
                    placeholder="Select use case…"
                    options={USE_CASES.map((u) => ({ value: u, label: u }))}
                    error={errors.useCase?.message}
                    {...register("useCase")}
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Button type="submit" size="sm" loading={isSubmitting}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Tool
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsOpen(false); reset(); setSelectedTool(""); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Audit Form Page ─────────────────────────────────────────────────

export default function AuditPage() {
  const router = useRouter();
  const { tools, isLoaded, addTool, removeTool, clearTools } = useAuditStore();
  const [isRunning, setIsRunning] = useState(false);

  const totalMonthlySpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);

  const handleRunAudit = async () => {
    if (tools.length === 0) return;
    setIsRunning(true);
    // Small delay for UX — shows loading state before navigation
    await new Promise((r) => setTimeout(r, 800));
    router.push("/results");
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="info" className="mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Audit Form
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Add your AI tools
          </h1>
          <p className="text-slate-400">
            Enter each AI tool your team pays for. We&apos;ll calculate your
            potential savings instantly.
          </p>
        </div>

        {/* Summary bar */}
        {tools.length > 0 && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-500">Tools added</p>
                <p className="font-semibold text-white font-mono-numbers">{tools.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Monthly spend</p>
                <p className="font-semibold text-white font-mono-numbers">${totalMonthlySpend.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Annual spend</p>
                <p className="font-semibold text-white font-mono-numbers">${(totalMonthlySpend * 12).toFixed(0)}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearTools} className="text-slate-500">
              Clear all
            </Button>
          </div>
        )}

        {/* Tool list */}
        <div className="space-y-3 mb-4">
          {!isLoaded ? (
            // Skeleton loading state
            <div className="space-y-3" aria-label="Loading saved tools…">
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
            <div className="rounded-xl border border-dashed border-white/10 py-10 text-center" role="status" aria-live="polite">
              <p className="text-slate-500 text-sm">No tools added yet.</p>
              <p className="text-slate-600 text-xs mt-1">Add your first AI tool below ↓</p>
            </div>
          ) : (
            tools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                toolId={tool.id}
                tool={tool.tool}
                plan={tool.plan}
                monthlySpend={tool.monthlySpend}
                seats={tool.seats}
                useCase={tool.useCase}
                onRemove={removeTool}
                index={index}
              />
            ))
          )}
        </div>

        {/* Add tool form */}
        <AddToolForm onAdd={(data) => addTool({ ...data, plan: data.plan as import("@/types/audit").AIPlan })} />

        {/* Run Audit CTA */}
        {tools.length > 0 && (
          <div className="mt-8 space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={handleRunAudit}
              loading={isRunning}
              disabled={isRunning}
              id="run-audit-btn"
            >
              {isRunning ? "Analyzing your stack…" : "Run AI Spend Audit"}
              {!isRunning && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </Button>
            <p className="text-center text-xs text-slate-600">
              Results are instant and private — nothing leaves your browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
