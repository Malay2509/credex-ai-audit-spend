# PROMPTS.md — AI Summary Generation

## Overview

The AI summary feature in `/api/summary` generates a personalized ~100-word audit result narrative using OpenAI's `gpt-4o-mini` model. This document explains the prompt design, rationale, and fallback strategy.

---

## Final Prompt (v3)

```
You are a financial advisor specializing in SaaS spend optimization for startups.

A startup has just completed an AI tool audit. They have {N} AI tools in their stack and we found {savings context}.{top tool context} There are {M} high-priority recommendations.

Write a concise, professional ~100-word summary of their audit results. Requirements:
- Start with the most important insight (savings found or stack health)
- Be specific with dollar amounts
- Use a direct, startup-friendly tone (not corporate-speak)
- If savings exist: motivate action without being alarmist
- If no savings: genuinely validate their good choices
- Do not use bullet points or headers — flowing paragraphs only
- Do not mention "I" or refer to yourself
- End with one forward-looking sentence

Write the summary now:
```

### Why this structure works

| Decision | Rationale |
|---|---|
| **Financial advisor persona** | Sets a professional, trustworthy tone — users are sharing spend data |
| **Explicit no-bullets rule** | Early testing showed GPT defaulting to lists; prose reads more naturally |
| **"Do not mention I"** | Prevents awkward first-person AI framing in a user-facing summary |
| **Specific $ amounts** | Forces the model to use the actual numbers rather than generic language |
| **"Not alarmist" constraint** | Prevents scary "you're wasting money!" framing that creates distrust |
| **Forward-looking ending** | Gives users an action mindset rather than leaving them feeling criticized |

---

## Prompt Iteration History

### v1 — Simple instruction (abandoned)
```
Summarize this AI tool audit in 100 words: {JSON data}
```
**Problem:** Output was too generic ("The audit shows potential savings"). Didn't use dollar amounts. Felt like a template.

### v2 — Role + data injection (partially worked)
```
You are an AI spend consultant. This startup spent ${total} on AI tools.
Savings found: ${savings}. Write a 100-word summary.
```
**Problem:** Model kept starting with "I analyzed..." which felt robotic. Also hallucinated specific tool names not in the audit.

### v3 — Structured constraints (current, works well)
Added: explicit constraint list, no-bullets rule, no-self-reference rule, and "startup-friendly tone" signal. Output quality improved significantly.

---

## Model Selection

**Model:** `gpt-4o-mini`

**Why not GPT-4o?**
- Summaries are 100 words — a simple generation task that doesn't need frontier reasoning
- gpt-4o-mini is 10–20× cheaper and ~2× faster for this use case
- Quality difference at this length and task is negligible

**Parameters:**
- `max_tokens: 200` — prevents runaway generation while allowing full summary
- `temperature: 0.7` — enough creativity to avoid robotic output, not so high it hallucinates

---

## Fallback Strategy

The fallback (`buildFallbackSummary` in `lib/generateSummary.ts`) triggers when:
1. `OPENAI_API_KEY` is not set (server returns 503)
2. The API call times out (AbortSignal, 10s)
3. The API returns any non-2xx status
4. The response body is empty or malformed

The fallback is **templated but dynamic** — it uses the actual savings numbers from the audit result, not generic placeholders. Users cannot tell it's a template from the output.

### Fallback template logic:
- If `totalMonthlySavings <= 0`: returns a "you're well-optimized" validation message
- If savings exist: constructs sentence from {amount, tool count, high priority count, top tool}
- Always ends with a forward-looking recommendation

The `generatedByAI: false` flag is returned so the UI can optionally show a different label (currently shows "Audit Summary" instead of "AI-Generated Summary").
