/**
 * POST /api/summary
 *
 * Server-side Route Handler that calls the OpenAI API to generate
 * a personalized ~100-word audit summary. API key stays server-side only.
 *
 * Fallback: If OPENAI_API_KEY is not set, returns a 503 so the client
 * can use its built-in template fallback. See lib/generateSummary.ts.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SummaryPayload } from "@/lib/generateSummary";

// Initialize client lazily so missing key doesn't crash the whole app
let openaiClient: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * Build the prompt for the audit summary.
 * See PROMPTS.md for rationale and iteration history.
 */
function buildPrompt(payload: SummaryPayload): string {
  const {
    totalMonthlySavings,
    totalYearlySavings,
    overallSavingsPercent,
    totalTools,
    highPriorityCount,
    topTool,
    topSaving,
  } = payload;

  const savingsContext = totalMonthlySavings > 0
    ? `potential savings of $${Math.round(totalMonthlySavings)}/month ($${Math.round(totalYearlySavings)}/year), representing ${Math.round(overallSavingsPercent)}% of their current AI spend`
    : "no immediate savings opportunities (their stack is already well-optimized)";

  const topContext = topTool && topSaving
    ? ` The biggest single opportunity is ${topTool} ($${Math.round(topSaving)}/month savings).`
    : "";

  return `You are a financial advisor specializing in SaaS spend optimization for startups.

A startup has just completed an AI tool audit. They have ${totalTools} AI tool${totalTools !== 1 ? "s" : ""} in their stack and we found ${savingsContext}.${topContext} There are ${highPriorityCount} high-priority recommendation${highPriorityCount !== 1 ? "s" : ""}.

Write a concise, professional ~100-word summary of their audit results. Requirements:
- Start with the most important insight (savings found or stack health)
- Be specific with dollar amounts
- Use a direct, startup-friendly tone (not corporate-speak)
- If savings exist: motivate action without being alarmist
- If no savings: genuinely validate their good choices
- Do not use bullet points or headers — flowing paragraphs only
- Do not mention "I" or refer to yourself
- End with one forward-looking sentence

Write the summary now:`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const client = getClient();

    // No API key configured — client will use fallback
    if (!client) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    const payload = await request.json() as SummaryPayload;

    // Basic input validation
    if (typeof payload.totalTools !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const prompt = buildPrompt(payload);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Cost-efficient, fast, high quality for short summaries
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!summary) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    return NextResponse.json({
      summary,
      model: completion.model,
    });
  } catch (error) {
    console.error("[POST /api/summary] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
