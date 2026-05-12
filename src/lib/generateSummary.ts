/**
 * AI-generated personalized audit summary — lib/generateSummary.ts
 *
 * ARCHITECTURE DECISION:
 * - Calls the internal Next.js Route Handler at /api/summary (POST)
 * - Keeps API keys server-side only — never exposed to the browser
 * - If the API call fails for ANY reason, falls back to a templated summary
 *   so users always see useful output even when the AI is unavailable.
 */

import { AuditResult } from "@/types/audit";

export interface SummaryPayload {
  totalMonthlySavings: number;
  totalYearlySavings: number;
  overallSavingsPercent: number;
  totalTools: number;
  highPriorityCount: number;
  topTool?: string;
  topSaving?: number;
}

/**
 * Build a deterministic fallback summary when the AI API is unavailable.
 * This is intentionally human-sounding and avoids mentioning it is a template.
 */
export function buildFallbackSummary(payload: SummaryPayload): string {
  const { totalMonthlySavings, totalYearlySavings, overallSavingsPercent, totalTools, highPriorityCount, topTool, topSaving } = payload;

  if (totalMonthlySavings <= 0) {
    return `Great news — your AI stack of ${totalTools} tool${totalTools !== 1 ? "s" : ""} is well-optimized based on current pricing. You're already on the right plans for your team size. Continue to reassess quarterly as vendors adjust their pricing tiers.`;
  }

  const savingsLine = `We identified $${Math.round(totalMonthlySavings)}/month ($${Math.round(totalYearlySavings)}/year) in potential savings across ${totalTools} tool${totalTools !== 1 ? "s" : ""}.`;
  const impactLine = highPriorityCount > 0
    ? ` ${highPriorityCount} high-impact optimization${highPriorityCount > 1 ? "s" : ""} can be implemented immediately with no capability loss.`
    : "";
  const topLine = topTool && topSaving
    ? ` The largest single opportunity is your ${topTool} subscription, where switching plans could save $${Math.round(topSaving)}/month.`
    : "";
  const closingLine = overallSavingsPercent >= 30
    ? " These savings represent a meaningful budget reallocation — funds that could be redirected toward engineering, growth, or runway extension."
    : " Small optimizations compound: the savings here represent real cash freed up for higher-priority investments.";

  return `${savingsLine}${impactLine}${topLine}${closingLine}`;
}

/**
 * Extract structured payload from a full AuditResult for summary generation.
 */
export function extractSummaryPayload(result: AuditResult): SummaryPayload {
  const topRec = [...result.recommendations]
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  return {
    totalMonthlySavings: result.totalMonthlySavings,
    totalYearlySavings: result.totalYearlySavings,
    overallSavingsPercent: result.overallSavingsPercent,
    totalTools: result.recommendations.length,
    highPriorityCount: result.recommendations.filter((r) => r.priority === "high").length,
    topTool: topRec?.tool,
    topSaving: topRec?.monthlySavings,
  };
}

/**
 * Fetch an AI-generated summary from the Next.js Route Handler.
 * Falls back to a templated summary on any error.
 */
export async function generateAuditSummary(
  result: AuditResult
): Promise<{ text: string; generatedByAI: boolean; model?: string }> {
  const payload = extractSummaryPayload(result);

  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // 10-second timeout — don't block the UI
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json() as { summary: string; model: string };
    return { text: data.summary, generatedByAI: true, model: data.model };
  } catch (err) {
    // Graceful fallback — always returns something useful
    console.warn("[generateAuditSummary] AI API unavailable, using fallback:", err);
    return { text: buildFallbackSummary(payload), generatedByAI: false };
  }
}
