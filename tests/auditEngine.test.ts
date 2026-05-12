/**
 * Audit Engine Tests — tests/auditEngine.test.ts
 *
 * Tests for the rule-based audit logic in lib/auditEngine.ts.
 * Run with: npm run test
 */

import { describe, it, expect } from "vitest";
import { runAudit, getPlansForTool } from "@/lib/auditEngine";
import { AuditToolEntry } from "@/types/audit";

// ─── Helper ───────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<AuditToolEntry>): AuditToolEntry {
  return {
    id: "test-id",
    tool: "ChatGPT",
    plan: "Team",
    monthlySpend: 50,
    seats: 2,
    teamSize: 2,
    useCase: "mixed",
    ...overrides,
  };
}

// ─── Test 1: ChatGPT Team downgrade ───────────────────────────────────────

describe("ChatGPT audit rules", () => {
  it("recommends Plus over Team when seats <= 2", () => {
    const entry = makeEntry({ tool: "ChatGPT", plan: "Team", seats: 2, monthlySpend: 50 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Plus");
    expect(rec.priority).toBe("high");
    expect(rec.monthlySavings).toBe(10); // $50 - (2 * $20) = $10
    expect(rec.yearlySavings).toBe(120);
    expect(rec.confidenceScore).toBeGreaterThanOrEqual(90);
  });

  it("recommends Team over Enterprise for small teams", () => {
    const entry = makeEntry({ tool: "ChatGPT", plan: "Enterprise", seats: 3, monthlySpend: 300 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Team");
    expect(rec.priority).toBe("high");
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it("finds no savings when ChatGPT Plus is used correctly", () => {
    const entry = makeEntry({ tool: "ChatGPT", plan: "Plus", seats: 1, monthlySpend: 20 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.monthlySavings).toBe(0);
    expect(rec.priority).toBe("none");
  });
});

// ─── Test 2: Cursor Business optimization ────────────────────────────────

describe("Cursor audit rules", () => {
  it("recommends Pro over Business for solo developer", () => {
    const entry = makeEntry({ tool: "Cursor", plan: "Business", seats: 1, monthlySpend: 40 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Pro");
    expect(rec.priority).toBe("high");
    expect(rec.monthlySavings).toBe(20); // $40 - $20
    expect(rec.yearlySavings).toBe(240);
    expect(rec.confidenceScore).toBeGreaterThanOrEqual(95);
  });

  it("recommends Pro over Business for teams of 2-3", () => {
    const entry = makeEntry({ tool: "Cursor", plan: "Business", seats: 3, monthlySpend: 120 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Pro");
    expect(rec.monthlySavings).toBe(60); // $120 - (3 * $20)
  });

  it("finds no savings for correctly-priced Cursor Pro", () => {
    const entry = makeEntry({ tool: "Cursor", plan: "Pro", seats: 2, monthlySpend: 40 });
    const result = runAudit([entry]);
    expect(result.recommendations[0].monthlySavings).toBe(0);
  });
});

// ─── Test 3: Savings calculations accuracy ───────────────────────────────

describe("Savings calculation accuracy", () => {
  it("calculates total savings correctly for multiple tools", () => {
    const entries = [
      makeEntry({ id: "1", tool: "ChatGPT", plan: "Team", seats: 2, monthlySpend: 50 }),     // saves $10
      makeEntry({ id: "2", tool: "Cursor", plan: "Business", seats: 1, monthlySpend: 40 }),   // saves $20
    ];
    const result = runAudit(entries);

    expect(result.totalMonthlySavings).toBe(30);
    expect(result.totalYearlySavings).toBe(360);
    expect(result.totalMonthlySpend).toBe(90);
    expect(result.overallSavingsPercent).toBeCloseTo(33.33, 0);
  });

  it("returns zero savings for an already-optimal stack", () => {
    const entries = [
      makeEntry({ id: "1", tool: "ChatGPT", plan: "Plus", seats: 1, monthlySpend: 20 }),
      makeEntry({ id: "2", tool: "Cursor", plan: "Pro", seats: 1, monthlySpend: 20 }),
    ];
    const result = runAudit(entries);

    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalYearlySavings).toBe(0);
    expect(result.overallSavingsPercent).toBe(0);
  });

  it("never returns negative savings", () => {
    // Monthly spend is less than optimized would be — should clamp to 0
    const entry = makeEntry({ tool: "ChatGPT", plan: "Team", seats: 2, monthlySpend: 35 });
    const result = runAudit([entry]);
    expect(result.recommendations[0].monthlySavings).toBeGreaterThanOrEqual(0);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
  });
});

// ─── Test 4: GitHub Copilot rules ────────────────────────────────────────

describe("GitHub Copilot audit rules", () => {
  it("recommends Individual over Business for <=2 users", () => {
    const entry = makeEntry({ tool: "GitHub Copilot", plan: "Business", seats: 2, monthlySpend: 38 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Individual");
    expect(rec.monthlySavings).toBe(18); // $38 - (2 * $10)
    expect(rec.priority).toBe("medium");
  });

  it("recommends Business over Enterprise for <=5 users", () => {
    const entry = makeEntry({ tool: "GitHub Copilot", plan: "Enterprise", seats: 4, monthlySpend: 200 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Business");
    expect(rec.priority).toBe("high");
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });
});

// ─── Test 5: OpenAI API rules ─────────────────────────────────────────────

describe("OpenAI API audit rules", () => {
  it("flags high API spend for writing use case", () => {
    const entry = makeEntry({ tool: "OpenAI API", plan: "Pay-as-you-go", monthlySpend: 300, useCase: "writing" });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.priority).toBe("high");
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.optimizedMonthlySpend).toBeLessThan(300);
  });

  it("recommends committed use for spend >= $500", () => {
    const entry = makeEntry({ tool: "OpenAI API", plan: "Pay-as-you-go", monthlySpend: 600, useCase: "coding" });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Committed Use");
    expect(rec.priority).toBe("high");
  });

  it("returns no savings for low API spend", () => {
    const entry = makeEntry({ tool: "OpenAI API", plan: "Pay-as-you-go", monthlySpend: 20, useCase: "coding" });
    const result = runAudit([entry]);
    expect(result.recommendations[0].monthlySavings).toBe(0);
  });
});

// ─── Test 6: Windsurf rules ───────────────────────────────────────────────

describe("Windsurf audit rules", () => {
  it("recommends Pro over Teams for <=2 users", () => {
    const entry = makeEntry({ tool: "Windsurf", plan: "Teams", seats: 1, monthlySpend: 30 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Pro");
    expect(rec.monthlySavings).toBe(15);
    expect(rec.priority).toBe("high");
  });
});

// ─── Test 7: New tools are supported ─────────────────────────────────────

describe("New tools (Anthropic API, Windsurf)", () => {
  it("handles Anthropic API entry without crashing", () => {
    const entry = makeEntry({ tool: "Anthropic API", plan: "Pay-as-you-go", monthlySpend: 50 });
    expect(() => runAudit([entry])).not.toThrow();
  });

  it("handles empty tool list", () => {
    const result = runAudit([]);
    expect(result.recommendations).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalYearlySavings).toBe(0);
  });
});

// ─── Test 8: getPlansForTool ──────────────────────────────────────────────

describe("getPlansForTool", () => {
  it("returns correct plans for all 8 tools", () => {
    expect(getPlansForTool("ChatGPT")).toContain("Team");
    expect(getPlansForTool("Claude")).toContain("Pro");
    expect(getPlansForTool("Cursor")).toContain("Business");
    expect(getPlansForTool("GitHub Copilot")).toContain("Enterprise");
    expect(getPlansForTool("Gemini")).toContain("Advanced");
    expect(getPlansForTool("OpenAI API")).toContain("Committed Use");
    expect(getPlansForTool("Anthropic API")).toContain("Pay-as-you-go");
    expect(getPlansForTool("Windsurf")).toContain("Teams");
  });

  it("returns empty array for unknown tool", () => {
    expect(getPlansForTool("UnknownTool")).toHaveLength(0);
  });
});

// ─── Test 9: Claude rules ─────────────────────────────────────────────────

describe("Claude audit rules", () => {
  it("recommends Pro over Team for <= 3 users", () => {
    const entry = makeEntry({ tool: "Claude", plan: "Team", seats: 2, monthlySpend: 50 });
    const result = runAudit([entry]);
    const rec = result.recommendations[0];

    expect(rec.recommendedPlan).toBe("Pro");
    expect(rec.priority).toBe("high");
    expect(rec.monthlySavings).toBe(10); // $50 - (2 * $20) = $10
  });
});

// ─── Test 10: Yearly savings = 12x monthly savings ───────────────────────

describe("Savings math invariants", () => {
  it("yearly savings always equals monthly savings * 12", () => {
    const entries = [
      makeEntry({ id: "1", tool: "ChatGPT", plan: "Team", seats: 2, monthlySpend: 50 }),
      makeEntry({ id: "2", tool: "Cursor", plan: "Business", seats: 1, monthlySpend: 40 }),
      makeEntry({ id: "3", tool: "Windsurf", plan: "Teams", seats: 2, monthlySpend: 60 }),
    ];
    const result = runAudit(entries);
    result.recommendations.forEach((rec) => {
      expect(rec.yearlySavings).toBe(rec.monthlySavings * 12);
    });
    expect(result.totalYearlySavings).toBe(result.totalMonthlySavings * 12);
  });
});
