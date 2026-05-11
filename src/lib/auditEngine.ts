/**
 * AI Spend Audit Engine — Rule-Based Optimization Logic
 *
 * ARCHITECTURE DECISION:
 * This module uses purely rule-based logic (no AI/ML) for audit calculations.
 * This ensures:
 *  1. Deterministic, auditable results
 *  2. Zero external API dependency at MVP stage
 *  3. Easy to extend with new rules as we learn from user data
 *
 * Each rule targets a specific (tool, plan, condition) combination and
 * returns a structured recommendation with accurate savings math.
 */

import {
  AuditToolEntry,
  AuditResult,
  AuditRecommendation,
  AIPlan,
} from "@/types/audit";

// ─── Rule: ChatGPT ──────────────────────────────────────────────────────────

/**
 * ChatGPT pricing reference (as of 2024):
 * - Plus: $20/user/month
 * - Team: $25/user/month (min 2 users)
 * - Enterprise: custom pricing
 */
function auditChatGPT(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Team" && seats <= 2) {
    // Team plan with ≤2 users → switch to Plus ($20/user) = $40 total
    const optimizedSpend = 20 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Plus",
        optimizedMonthlySpend: optimizedSpend,
        reason: `ChatGPT Team (≤2 users) costs more than 2× Plus plans. Switch to ChatGPT Plus at $20/user to save ${Math.round((savings / monthlySpend) * 100)}% monthly.`,
        priority: "high",
      };
    }
  }

  if (plan === "Team" && seats >= 3 && monthlySpend > 25 * seats) {
    // Overpaying on Team — might have stale billing
    const optimizedSpend = 25 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Team",
        optimizedMonthlySpend: optimizedSpend,
        reason: `Your ChatGPT Team billing appears higher than standard $25/seat/month. Review your billing cycle for potential overages.`,
        priority: "medium",
      };
    }
  }

  if (plan === "Enterprise" && seats <= 5) {
    // Enterprise with very few users is almost always over-scoped
    const optimizedSpend = 25 * seats; // recommend Team
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Team",
        optimizedMonthlySpend: optimizedSpend,
        reason: `ChatGPT Enterprise with only ${seats} users is over-scoped. ChatGPT Team offers the same collaboration features at $25/seat.`,
        priority: "high",
      };
    }
  }

  return {};
}

// ─── Rule: Claude ────────────────────────────────────────────────────────────

/**
 * Claude pricing reference (as of 2024):
 * - Pro: $20/user/month
 * - Team: $25/user/month (min 5 users)
 */
function auditClaude(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Team" && seats <= 3) {
    const optimizedSpend = 20 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Pro",
        optimizedMonthlySpend: optimizedSpend,
        reason: `Claude Team (≤3 users) costs more than individual Pro plans. Switch each user to Claude Pro at $20/user to save $${savings}/month.`,
        priority: "high",
      };
    }
  }

  if (plan === "Enterprise" && seats <= 10) {
    const optimizedSpend = 25 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Team",
        optimizedMonthlySpend: optimizedSpend,
        reason: `Claude Enterprise with a small team (${seats} users) may not justify the premium. Claude Team at $25/user provides similar collaborative features.`,
        priority: "medium",
      };
    }
  }

  return {};
}

// ─── Rule: Cursor ─────────────────────────────────────────────────────────────

/**
 * Cursor pricing reference (as of 2024):
 * - Pro: $20/user/month
 * - Business: $40/user/month
 */
function auditCursor(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Business" && seats <= 3) {
    const optimizedSpend = 20 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Pro",
        optimizedMonthlySpend: optimizedSpend,
        reason: `Cursor Business (≤3 users) doubles the cost of Pro with minimal extra features at this team size. Switch to Cursor Pro to cut spending by 50%.`,
        priority: "high",
      };
    }
  }

  if (plan === "Business" && seats <= 8 && monthlySpend > 40 * seats) {
    const optimizedSpend = 40 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Business",
        optimizedMonthlySpend: optimizedSpend,
        reason: `Your Cursor Business plan seems to have billing overages beyond $40/seat. Audit your billing for unused seats.`,
        priority: "medium",
      };
    }
  }

  return {};
}

// ─── Rule: GitHub Copilot ─────────────────────────────────────────────────────

/**
 * GitHub Copilot pricing reference (as of 2024):
 * - Individual: $10/user/month
 * - Business: $19/user/month
 * - Enterprise: $39/user/month
 */
function auditGitHubCopilot(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Business" && seats <= 2) {
    const optimizedSpend = 10 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Individual",
        optimizedMonthlySpend: optimizedSpend,
        reason: `GitHub Copilot Business (≤2 users) costs nearly 2× Individual plans without meaningful additional value for tiny teams.`,
        priority: "medium",
      };
    }
  }

  if (plan === "Enterprise" && seats <= 5) {
    const optimizedSpend = 19 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Business",
        optimizedMonthlySpend: optimizedSpend,
        reason: `GitHub Copilot Enterprise (≤5 users) at $39/seat has expensive compliance features most small teams don't need. Business plan at $19/seat covers most use cases.`,
        priority: "high",
      };
    }
  }

  return {};
}

// ─── Rule: Gemini ─────────────────────────────────────────────────────────────

/**
 * Gemini pricing reference (as of 2024):
 * - Advanced: ~$19.99/user/month (Google One AI Premium)
 * - Business: $24/user/month (Workspace add-on)
 */
function auditGemini(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Business" && seats <= 3) {
    const optimizedSpend = 20 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Advanced",
        optimizedMonthlySpend: optimizedSpend,
        reason: `Gemini Business (≤3 users) is more expensive than individual Advanced plans without the workspace compliance requirements that justify it.`,
        priority: "medium",
      };
    }
  }

  if (plan === "Enterprise" && seats <= 10) {
    const optimizedSpend = 24 * seats;
    const savings = monthlySpend - optimizedSpend;
    if (savings > 0) {
      return {
        recommendedPlan: "Business",
        optimizedMonthlySpend: optimizedSpend,
        reason: `Gemini Enterprise (${seats} users) may be over-scoped. Business plan at $24/user provides strong team features without enterprise compliance overhead.`,
        priority: "medium",
      };
    }
  }

  return {};
}

// ─── Rule: OpenAI API ─────────────────────────────────────────────────────────

/**
 * OpenAI API optimization: Look for over-spending patterns.
 * For API usage, the main optimization is model selection and caching.
 */
function auditOpenAIAPI(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { monthlySpend, useCase } = entry;

  // High API spend → recommend GPT-3.5 for appropriate use cases
  if (monthlySpend >= 200 && (useCase === "Writing" || useCase === "Customer Support")) {
    const optimizedSpend = Math.round(monthlySpend * 0.6); // ~40% savings switching to cheaper models
    return {
      recommendedPlan: "Pay-as-you-go",
      optimizedMonthlySpend: optimizedSpend,
      reason: `For ${useCase} workloads, switching from GPT-4 to GPT-3.5-turbo or GPT-4o-mini for non-critical tasks can reduce API costs by ~40%. Implement response caching for repeated queries.`,
      priority: "high",
    };
  }

  if (monthlySpend >= 500) {
    const optimizedSpend = Math.round(monthlySpend * 0.75); // 25% via caching + batching
    return {
      recommendedPlan: "Committed Use",
      optimizedMonthlySpend: optimizedSpend,
      reason: `At $${monthlySpend}/month OpenAI API spend, you qualify for committed use discounts. Batching non-realtime requests and adding semantic caching can save 25–40%.`,
      priority: "high",
    };
  }

  return {};
}

// ─── Main Audit Engine ────────────────────────────────────────────────────────

/**
 * Run the full audit on a list of tool entries.
 * Returns a structured AuditResult with per-tool recommendations and totals.
 */
export function runAudit(entries: AuditToolEntry[]): AuditResult {
  const recommendations: AuditRecommendation[] = entries.map((entry) => {
    // Dispatch to the correct rule function
    let ruleResult: Partial<AuditRecommendation> = {};

    switch (entry.tool) {
      case "ChatGPT":
        ruleResult = auditChatGPT(entry);
        break;
      case "Claude":
        ruleResult = auditClaude(entry);
        break;
      case "Cursor":
        ruleResult = auditCursor(entry);
        break;
      case "GitHub Copilot":
        ruleResult = auditGitHubCopilot(entry);
        break;
      case "Gemini":
        ruleResult = auditGemini(entry);
        break;
      case "OpenAI API":
        ruleResult = auditOpenAIAPI(entry);
        break;
    }

    const currentMonthlySpend = entry.monthlySpend;
    const optimizedMonthlySpend =
      ruleResult.optimizedMonthlySpend ?? currentMonthlySpend;
    const monthlySavings = Math.max(0, currentMonthlySpend - optimizedMonthlySpend);
    const yearlySavings = monthlySavings * 12;
    const savingsPercent =
      currentMonthlySpend > 0 ? (monthlySavings / currentMonthlySpend) * 100 : 0;

    return {
      toolId: entry.id,
      tool: entry.tool,
      currentPlan: entry.plan,
      recommendedPlan: ruleResult.recommendedPlan ?? null,
      currentMonthlySpend,
      optimizedMonthlySpend,
      monthlySavings,
      yearlySavings,
      reason:
        ruleResult.reason ??
        `Your ${entry.tool} ${entry.plan} plan appears optimally configured for your current usage.`,
      savingsPercent,
      priority: ruleResult.priority ?? "none",
    };
  });

  const totalMonthlySpend = recommendations.reduce(
    (sum, r) => sum + r.currentMonthlySpend,
    0
  );
  const totalOptimizedMonthlySpend = recommendations.reduce(
    (sum, r) => sum + r.optimizedMonthlySpend,
    0
  );
  const totalMonthlySavings = Math.max(0, totalMonthlySpend - totalOptimizedMonthlySpend);
  const totalYearlySavings = totalMonthlySavings * 12;
  const overallSavingsPercent =
    totalMonthlySpend > 0 ? (totalMonthlySavings / totalMonthlySpend) * 100 : 0;

  return {
    recommendations,
    totalMonthlySpend,
    totalOptimizedMonthlySpend,
    totalMonthlySavings,
    totalYearlySavings,
    overallSavingsPercent,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get the priority color class for a recommendation.
 * Used in UI components for visual priority indication.
 */
export function getPriorityColor(priority: AuditRecommendation["priority"]): string {
  switch (priority) {
    case "high":
      return "text-red-400";
    case "medium":
      return "text-yellow-400";
    case "low":
      return "text-blue-400";
    default:
      return "text-emerald-400";
  }
}

/**
 * Get the priority label for display.
 */
export function getPriorityLabel(priority: AuditRecommendation["priority"]): string {
  switch (priority) {
    case "high":
      return "High Impact";
    case "medium":
      return "Medium Impact";
    case "low":
      return "Low Impact";
    default:
      return "Optimized";
  }
}

/**
 * Get plan options for a given AI tool.
 * Used to populate the plan dropdown in the audit form.
 */
export function getPlansForTool(tool: string): AIPlan[] {
  switch (tool) {
    case "ChatGPT":
      return ["Free", "Plus", "Team", "Enterprise"];
    case "Claude":
      return ["Free", "Pro", "Team", "Enterprise"];
    case "Cursor":
      return ["Hobby", "Pro", "Business"];
    case "GitHub Copilot":
      return ["Individual", "Business", "Enterprise"];
    case "Gemini":
      return ["Free", "Advanced", "Business", "Enterprise"];
    case "OpenAI API":
      return ["Pay-as-you-go", "Committed Use"];
    default:
      return [];
  }
}
