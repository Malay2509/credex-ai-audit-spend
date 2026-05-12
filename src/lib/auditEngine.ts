/**
 * AI Spend Audit Engine — Rule-Based Optimization Logic (Day 2)
 *
 * ARCHITECTURE DECISION:
 * Pure rule-based logic — no AI/ML, no external API calls.
 * Deterministic, auditable, finance-grade recommendations.
 *
 * PRICING SOURCES: See PRICING_DATA.md for all verified pricing.
 *
 * Rule structure:
 *   Each tool has its own audit function that receives an AuditToolEntry
 *   and returns Partial<AuditRecommendation>. The main runAudit() orchestrator
 *   fills in totals and defaults. This makes adding new rules trivial.
 */

import {
  AuditToolEntry,
  AuditResult,
  AuditRecommendation,
  AIPlan,
} from "@/types/audit";

// ─── Pricing constants (source: PRICING_DATA.md) ──────────────────────────

const PRICING = {
  chatgpt: { plus: 20, team: 25 },
  claude: { pro: 20, team: 25 },
  cursor: { hobby: 0, pro: 20, business: 40 },
  githubCopilot: { individual: 10, business: 19, enterprise: 39 },
  gemini: { advanced: 19.99, business: 24 },
  windsurf: { free: 0, pro: 15, teams: 30 },
} as const;

// ─── Helper ───────────────────────────────────────────────────────────────

function savings(current: number, optimized: number) {
  return Math.max(0, current - optimized);
}

// ─── Rule: ChatGPT ────────────────────────────────────────────────────────

/**
 * ChatGPT pricing (verified 2025-05):
 * - Plus:       $20/user/month  — individual subscription
 * - Team:       $25/user/month  — min 2 users, shared workspace
 * - Enterprise: custom          — SSO, advanced admin, data privacy
 *
 * Rules:
 * 1. Team plan with ≤2 users → switch to Plus (saves Team overhead)
 * 2. Enterprise with ≤5 users → downgrade to Team
 * 3. Team plan but monthlySpend > standard rate → billing overage flag
 */
function auditChatGPT(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Team" && seats <= 2) {
    const optimized = PRICING.chatgpt.plus * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Plus",
        optimizedMonthlySpend: optimized,
        reason: `With only ${seats} user${seats > 1 ? "s" : ""}, ChatGPT Team ($25/seat) costs more than individual Plus plans ($20/seat). Switching saves you $${saved}/month with no feature loss for small teams.`,
        priority: "high",
        confidenceScore: 95,
        actionLabel: "Switch to ChatGPT Plus",
      };
    }
  }

  if (plan === "Enterprise" && seats <= 5) {
    const optimized = PRICING.chatgpt.team * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Team",
        optimizedMonthlySpend: optimized,
        reason: `ChatGPT Enterprise is designed for large orgs with compliance needs. With ${seats} users, Team plan at $25/seat provides equivalent collaboration features and saves you $${saved}/month.`,
        priority: "high",
        confidenceScore: 88,
        actionLabel: "Downgrade to ChatGPT Team",
      };
    }
  }

  if (plan === "Team" && seats >= 3 && monthlySpend > PRICING.chatgpt.team * seats * 1.05) {
    const optimized = PRICING.chatgpt.team * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Team",
        optimizedMonthlySpend: optimized,
        reason: `Your ChatGPT Team billing ($${monthlySpend}/mo) is higher than the standard $${PRICING.chatgpt.team}/seat rate. You may have unused seats or billing overages. Review your workspace members.`,
        priority: "medium",
        confidenceScore: 70,
        actionLabel: "Audit billing seats",
      };
    }
  }

  return {};
}

// ─── Rule: Claude ─────────────────────────────────────────────────────────

/**
 * Claude pricing (verified 2025-05):
 * - Pro:        $20/user/month
 * - Team:       $25/user/month  — min 5 users, admin console
 * - Enterprise: custom
 *
 * Rules:
 * 1. Team with ≤3 users → individual Pro plans are cheaper
 * 2. Enterprise with ≤10 users → Team is sufficient
 * 3. Team for "writing" use case with 1 user → Pro suffices
 */
function auditClaude(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend, useCase } = entry;

  if (plan === "Team" && seats <= 3) {
    const optimized = PRICING.claude.pro * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Pro",
        optimizedMonthlySpend: optimized,
        reason: `Claude Team requires a minimum of 5 users to make economic sense. With ${seats} user${seats > 1 ? "s" : ""}, individual Pro plans at $20/user save you $${saved}/month and offer the same model access.`,
        priority: "high",
        confidenceScore: 92,
        actionLabel: "Switch to Claude Pro",
      };
    }
  }

  if (plan === "Team" && seats === 1 && useCase === "writing") {
    const optimized = PRICING.claude.pro;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Pro",
        optimizedMonthlySpend: optimized,
        reason: `For solo writing use cases, Claude Pro ($20/month) provides full model access without the Team plan overhead. Save $${saved}/month immediately.`,
        priority: "high",
        confidenceScore: 95,
        actionLabel: "Downgrade to Claude Pro",
      };
    }
  }

  if (plan === "Enterprise" && seats <= 10) {
    const optimized = PRICING.claude.team * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Team",
        optimizedMonthlySpend: optimized,
        reason: `Claude Enterprise is built for large compliance-heavy organizations. With ${seats} users, Team at $25/user provides centralized billing and admin tools at a fraction of Enterprise pricing.`,
        priority: "medium",
        confidenceScore: 80,
        actionLabel: "Evaluate Claude Team",
      };
    }
  }

  return {};
}

// ─── Rule: Cursor ─────────────────────────────────────────────────────────

/**
 * Cursor pricing (verified 2025-05):
 * - Hobby:    $0/month   — limited completions
 * - Pro:      $20/user/month — unlimited completions, GPT-4
 * - Business: $40/user/month — SSO, centralized billing, usage analytics
 *
 * Rules:
 * 1. Business with ≤3 users → Pro is identical in AI features
 * 2. Business plan, solo developer → Cursor Pro at half the price
 * 3. Business with billing overage → flag unused seats
 */
function auditCursor(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Business" && seats === 1) {
    const optimized = PRICING.cursor.pro;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Pro",
        optimizedMonthlySpend: optimized,
        reason: `Cursor Business adds SSO and centralized billing — features irrelevant for a solo developer. Cursor Pro at $20/month provides identical AI completions and saves you $${saved}/month.`,
        priority: "high",
        confidenceScore: 98,
        actionLabel: "Switch to Cursor Pro",
      };
    }
  }

  if (plan === "Business" && seats <= 3) {
    const optimized = PRICING.cursor.pro * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Pro",
        optimizedMonthlySpend: optimized,
        reason: `Cursor Business (${seats} users) costs $${PRICING.cursor.business}/seat vs $${PRICING.cursor.pro} for Pro — the only Business extras are SSO and admin analytics, which small teams rarely need. Switch to Pro and save $${saved}/month.`,
        priority: "high",
        confidenceScore: 90,
        actionLabel: "Switch to Cursor Pro",
      };
    }
  }

  if (plan === "Business" && monthlySpend > PRICING.cursor.business * seats * 1.05) {
    const optimized = PRICING.cursor.business * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Business",
        optimizedMonthlySpend: optimized,
        reason: `Your Cursor Business spend ($${monthlySpend}/mo) is above the standard $${PRICING.cursor.business}/seat rate for ${seats} seats. Check for inactive accounts or legacy billing.`,
        priority: "medium",
        confidenceScore: 65,
        actionLabel: "Audit Cursor seats",
      };
    }
  }

  return {};
}

// ─── Rule: GitHub Copilot ─────────────────────────────────────────────────

/**
 * GitHub Copilot pricing (verified 2025-05):
 * - Individual: $10/user/month
 * - Business:   $19/user/month — centralized policy, audit logs
 * - Enterprise: $39/user/month — custom model fine-tuning, Copilot Chat for Enterprise
 *
 * Rules:
 * 1. Business with ≤2 users → Individual plans save ~50%
 * 2. Enterprise with ≤5 users → Business covers all practical needs
 * 3. Business plan for coding-only, 1 user → Individual
 */
function auditGitHubCopilot(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend, useCase } = entry;

  if (plan === "Business" && seats <= 2) {
    const optimized = PRICING.githubCopilot.individual * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Individual",
        optimizedMonthlySpend: optimized,
        reason: `GitHub Copilot Business at $19/user adds team policy management for ${seats} user${seats > 1 ? "s" : ""}. Individual plans ($10/user) provide the same AI suggestions for small teams and save $${saved}/month.`,
        priority: "medium",
        confidenceScore: 85,
        actionLabel: "Switch to Individual plan",
      };
    }
  }

  if (plan === "Enterprise" && seats <= 5) {
    const optimized = PRICING.githubCopilot.business * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Business",
        optimizedMonthlySpend: optimized,
        reason: `GitHub Copilot Enterprise ($39/user) is designed for organizations needing custom model fine-tuning and enterprise Copilot Chat. With only ${seats} users, Business plan at $19/user is more appropriate and saves $${saved}/month.`,
        priority: "high",
        confidenceScore: 87,
        actionLabel: "Downgrade to Business plan",
      };
    }
  }

  if (plan === "Business" && seats === 1 && useCase === "coding") {
    const optimized = PRICING.githubCopilot.individual;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Individual",
        optimizedMonthlySpend: optimized,
        reason: `A solo developer on GitHub Copilot Business is paying $9/month extra for team management features they cannot use alone. Switch to Individual and save $${saved}/month.`,
        priority: "medium",
        confidenceScore: 95,
        actionLabel: "Switch to Individual",
      };
    }
  }

  return {};
}

// ─── Rule: Gemini ─────────────────────────────────────────────────────────

/**
 * Gemini pricing (verified 2025-05):
 * - Advanced:   $19.99/user/month (Google One AI Premium)
 * - Business:   $24/user/month   (Gemini for Google Workspace)
 * - Enterprise: custom
 *
 * Rules:
 * 1. Business with ≤3 users → Advanced individual plans are cheaper
 * 2. Enterprise with ≤10 users → Business covers most use cases
 */
function auditGemini(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Business" && seats <= 3) {
    const optimized = PRICING.gemini.advanced * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Advanced",
        optimizedMonthlySpend: Math.round(optimized),
        reason: `Gemini Business ($24/user) adds Workspace integration extras that ${seats} user${seats > 1 ? "s" : ""} may not need. Individual Advanced plans at ~$20/user offer the same Gemini 1.5 Pro access and save ~$${Math.round(saved)}/month.`,
        priority: "medium",
        confidenceScore: 72,
        actionLabel: "Evaluate Gemini Advanced",
      };
    }
  }

  if (plan === "Enterprise" && seats <= 10) {
    const optimized = PRICING.gemini.business * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Business",
        optimizedMonthlySpend: optimized,
        reason: `Gemini Enterprise pricing is typically 30–50% above Business for compliance and DLP features. With ${seats} users, Business plan provides team admin and audit features sufficient for most startups.`,
        priority: "medium",
        confidenceScore: 65,
        actionLabel: "Review Gemini Enterprise need",
      };
    }
  }

  return {};
}

// ─── Rule: OpenAI API ─────────────────────────────────────────────────────

/**
 * OpenAI API pricing (verified 2025-05, pay-as-you-go):
 * - No fixed subscription; purely usage-based.
 * - Optimization: model selection, caching, batching.
 *
 * Rules:
 * 1. Spend ≥$200 for writing/data → switch to GPT-4o-mini saves ~40%
 * 2. Spend ≥$500 → committed use discount + batching saves 25%
 * 3. Spend ≥$1000 → dedicated capacity discount available
 */
function auditOpenAIAPI(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { monthlySpend, useCase } = entry;

  if (monthlySpend >= 1000) {
    const optimized = Math.round(monthlySpend * 0.65);
    return {
      recommendedPlan: "Committed Use",
      optimizedMonthlySpend: optimized,
      reason: `At $${monthlySpend}/month, you qualify for OpenAI's committed-use discounts (up to 25% off) and should explore dedicated capacity. Additionally, switching non-critical tasks to gpt-4o-mini saves ~35% more.`,
      priority: "high",
      confidenceScore: 82,
      actionLabel: "Negotiate committed use",
    };
  }

  if (monthlySpend >= 500) {
    const optimized = Math.round(monthlySpend * 0.75);
    return {
      recommendedPlan: "Committed Use",
      optimizedMonthlySpend: optimized,
      reason: `OpenAI committed-use discounts and batching non-realtime requests can reduce your $${monthlySpend}/month API bill by ~25%. Implement semantic caching with a vector DB to eliminate repeated LLM calls.`,
      priority: "high",
      confidenceScore: 78,
      actionLabel: "Enable batching + caching",
    };
  }

  if (monthlySpend >= 200 && (useCase === "writing" || useCase === "data")) {
    const optimized = Math.round(monthlySpend * 0.6);
    return {
      recommendedPlan: "Pay-as-you-go",
      optimizedMonthlySpend: optimized,
      reason: `For ${useCase} tasks, gpt-4o-mini ($0.15/1M input tokens) vs gpt-4o ($2.50/1M) is often indistinguishable in quality. Routing 80% of requests to the cheaper model can cut your API bill by ~40%.`,
      priority: "high",
      confidenceScore: 80,
      actionLabel: "Route to gpt-4o-mini",
    };
  }

  if (monthlySpend >= 50) {
    return {
      recommendedPlan: "Pay-as-you-go",
      optimizedMonthlySpend: Math.round(monthlySpend * 0.85),
      reason: `Add response caching for repeated queries (e.g. Redis + embeddings similarity) to cut redundant API calls. At your usage level, this typically saves 10–15% monthly with minimal engineering effort.`,
      priority: "low",
      confidenceScore: 60,
      actionLabel: "Add response caching",
    };
  }

  return {};
}

// ─── Rule: Anthropic API ──────────────────────────────────────────────────

/**
 * Anthropic API pricing (verified 2025-05):
 * - Claude 3.5 Sonnet: $3/1M input, $15/1M output (pay-as-you-go)
 * - Claude 3 Haiku:    $0.25/1M input, $1.25/1M output
 *
 * Rules:
 * 1. High spend for writing/data → route to Haiku for non-critical tasks
 * 2. Very high spend → Anthropic enterprise agreement available
 */
function auditAnthropicAPI(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { monthlySpend, useCase } = entry;

  if (monthlySpend >= 500) {
    const optimized = Math.round(monthlySpend * 0.7);
    return {
      recommendedPlan: "Committed Use",
      optimizedMonthlySpend: optimized,
      reason: `At $${monthlySpend}/month, contact Anthropic for volume pricing. Additionally, routing classification, extraction, and simple generation tasks to Claude 3 Haiku (12× cheaper than Sonnet) can reduce costs by 30%.`,
      priority: "high",
      confidenceScore: 80,
      actionLabel: "Route to Claude Haiku",
    };
  }

  if (monthlySpend >= 100 && (useCase === "writing" || useCase === "data")) {
    const optimized = Math.round(monthlySpend * 0.65);
    return {
      recommendedPlan: "Pay-as-you-go",
      optimizedMonthlySpend: optimized,
      reason: `Claude 3 Haiku is 12× cheaper than Sonnet and handles ${useCase} tasks with near-identical output quality. Routing non-critical requests to Haiku typically saves 35%+ with minimal prompt changes.`,
      priority: "medium",
      confidenceScore: 78,
      actionLabel: "Switch to Claude Haiku",
    };
  }

  return {};
}

// ─── Rule: Windsurf ───────────────────────────────────────────────────────

/**
 * Windsurf pricing (verified 2025-05):
 * - Free:  $0/month — limited flows
 * - Pro:   $15/user/month — unlimited flows
 * - Teams: $30/user/month — centralized billing, admin
 *
 * Rules:
 * 1. Teams with ≤2 users → Pro plans are cheaper
 * 2. Teams + overlap with Cursor/Copilot → flag redundancy
 */
function auditWindsurf(entry: AuditToolEntry): Partial<AuditRecommendation> {
  const { plan, seats, monthlySpend } = entry;

  if (plan === "Teams" && seats <= 2) {
    const optimized = PRICING.windsurf.pro * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Pro",
        optimizedMonthlySpend: optimized,
        reason: `Windsurf Teams ($30/user) adds admin controls designed for larger teams. With ${seats} user${seats > 1 ? "s" : ""}, individual Pro plans at $15/user deliver the same AI flow features and save $${saved}/month.`,
        priority: "high",
        confidenceScore: 90,
        actionLabel: "Switch to Windsurf Pro",
      };
    }
  }

  if (plan === "Teams" && monthlySpend > PRICING.windsurf.teams * seats * 1.05) {
    const optimized = PRICING.windsurf.teams * seats;
    const saved = savings(monthlySpend, optimized);
    if (saved > 0) {
      return {
        recommendedPlan: "Teams",
        optimizedMonthlySpend: optimized,
        reason: `Your Windsurf Teams billing exceeds the standard $${PRICING.windsurf.teams}/user rate. Check for inactive accounts — you may be paying for seats that aren't being used.`,
        priority: "medium",
        confidenceScore: 65,
        actionLabel: "Audit Windsurf seats",
      };
    }
  }

  return {};
}

// ─── Main Audit Engine ────────────────────────────────────────────────────

/**
 * Run the full audit on a list of tool entries.
 * Pure function — no side effects, no network calls, fully testable.
 */
export function runAudit(entries: AuditToolEntry[]): AuditResult {
  const recommendations: AuditRecommendation[] = entries.map((entry) => {
    let ruleResult: Partial<AuditRecommendation> = {};

    switch (entry.tool) {
      case "ChatGPT":       ruleResult = auditChatGPT(entry);       break;
      case "Claude":        ruleResult = auditClaude(entry);        break;
      case "Cursor":        ruleResult = auditCursor(entry);        break;
      case "GitHub Copilot": ruleResult = auditGitHubCopilot(entry); break;
      case "Gemini":        ruleResult = auditGemini(entry);        break;
      case "OpenAI API":    ruleResult = auditOpenAIAPI(entry);     break;
      case "Anthropic API": ruleResult = auditAnthropicAPI(entry);  break;
      case "Windsurf":      ruleResult = auditWindsurf(entry);      break;
    }

    const currentMonthlySpend = entry.monthlySpend;
    const optimizedMonthlySpend = ruleResult.optimizedMonthlySpend ?? currentMonthlySpend;
    const monthlySavings = Math.max(0, currentMonthlySpend - optimizedMonthlySpend);
    const yearlySavings = monthlySavings * 12;
    const savingsPercent = currentMonthlySpend > 0
      ? (monthlySavings / currentMonthlySpend) * 100
      : 0;

    return {
      toolId: entry.id,
      tool: entry.tool,
      currentPlan: entry.plan,
      recommendedPlan: ruleResult.recommendedPlan ?? null,
      currentMonthlySpend,
      optimizedMonthlySpend,
      monthlySavings,
      yearlySavings,
      reason: ruleResult.reason ??
        `Your ${entry.tool} ${entry.plan} plan is appropriately sized for your team and usage pattern.`,
      savingsPercent,
      priority: ruleResult.priority ?? "none",
      confidenceScore: ruleResult.confidenceScore ?? 100,
      actionLabel: ruleResult.actionLabel ?? "No action needed",
    };
  });

  const totalMonthlySpend = recommendations.reduce((s, r) => s + r.currentMonthlySpend, 0);
  const totalOptimizedMonthlySpend = recommendations.reduce((s, r) => s + r.optimizedMonthlySpend, 0);
  const totalMonthlySavings = Math.max(0, totalMonthlySpend - totalOptimizedMonthlySpend);
  const totalYearlySavings = totalMonthlySavings * 12;
  const overallSavingsPercent = totalMonthlySpend > 0
    ? (totalMonthlySavings / totalMonthlySpend) * 100
    : 0;

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

// ─── UI Helpers ───────────────────────────────────────────────────────────

export function getPriorityColor(priority: AuditRecommendation["priority"]): string {
  switch (priority) {
    case "high":   return "text-red-400";
    case "medium": return "text-yellow-400";
    case "low":    return "text-blue-400";
    default:       return "text-emerald-400";
  }
}

export function getPriorityLabel(priority: AuditRecommendation["priority"]): string {
  switch (priority) {
    case "high":   return "High Impact";
    case "medium": return "Medium Impact";
    case "low":    return "Low Impact";
    default:       return "Optimized";
  }
}

export function getPlansForTool(tool: string): AIPlan[] {
  switch (tool) {
    case "ChatGPT":       return ["Free", "Plus", "Team", "Enterprise"];
    case "Claude":        return ["Free", "Pro", "Team", "Enterprise"];
    case "Cursor":        return ["Hobby", "Pro", "Business"];
    case "GitHub Copilot": return ["Individual", "Business", "Enterprise"];
    case "Gemini":        return ["Free", "Advanced", "Business", "Enterprise"];
    case "OpenAI API":    return ["Pay-as-you-go", "Committed Use"];
    case "Anthropic API": return ["Pay-as-you-go", "Committed Use"];
    case "Windsurf":      return ["Free", "Pro", "Teams"];
    default:              return [];
  }
}
