# TESTS.md — Audit Engine Test Documentation

## Overview

Tests are written with **Vitest** and cover all rule-based logic in `lib/auditEngine.ts`.

## Running Tests

```bash
# Run all tests once
npm run test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

**Current status:** ✅ 21 tests, 21 passing

---

## Test File

`tests/auditEngine.test.ts`

---

## Test Coverage

### Suite 1: ChatGPT audit rules (3 tests)
| Test | What it covers |
|---|---|
| recommends Plus over Team when seats ≤ 2 | Core downgrade rule, savings math ($50 → $40), priority=high, confidence ≥ 90 |
| recommends Team over Enterprise for small teams | Enterprise downgrade path for ≤5 users |
| no savings when ChatGPT Plus is used correctly | Ensures zero-savings path returns priority="none" |

### Suite 2: Cursor audit rules (3 tests)
| Test | What it covers |
|---|---|
| recommends Pro over Business for solo developer | $40→$20, saves $20/mo, confidence ≥ 95 |
| recommends Pro over Business for teams of 2–3 | Multi-seat savings calculation |
| no savings for correctly-priced Cursor Pro | Zero savings path |

### Suite 3: Savings calculation accuracy (3 tests)
| Test | What it covers |
|---|---|
| calculates total savings for multiple tools | Multi-tool aggregation, overallSavingsPercent |
| returns zero for optimal stack | Zero savings path with two optimized tools |
| never returns negative savings | Negative-savings guard via `Math.max(0, ...)` |

### Suite 4: GitHub Copilot rules (2 tests)
| Test | What it covers |
|---|---|
| recommends Individual over Business for ≤2 users | $38→$20 savings, medium priority |
| recommends Business over Enterprise for ≤5 users | High-priority downgrade path |

### Suite 5: OpenAI API rules (3 tests)
| Test | What it covers |
|---|---|
| flags high API spend for writing use case | $300 spend → gpt-4o-mini routing recommendation |
| recommends committed use for spend ≥ $500 | Volume discount recommendation |
| no savings for low API spend | $20 spend returns no recommendation |

### Suite 6: Windsurf rules (1 test)
| Test | What it covers |
|---|---|
| recommends Pro over Teams for ≤2 users | $30→$15, saves $15/mo, high priority |

### Suite 7: New tools support (2 tests)
| Test | What it covers |
|---|---|
| handles Anthropic API entry without crashing | Smoke test for new tool integration |
| handles empty tool list | Edge case — empty input returns empty result |

### Suite 8: getPlansForTool (2 tests)
| Test | What it covers |
|---|---|
| returns correct plans for all 8 tools | Plan list correctness for every supported tool |
| returns empty array for unknown tool | Unknown tool graceful handling |

### Suite 9: Claude rules (1 test)
| Test | What it covers |
|---|---|
| recommends Pro over Team for ≤3 users | $50→$40 savings, high priority |

### Suite 10: Savings math invariants (1 test)
| Test | What it covers |
|---|---|
| yearly savings = 12 × monthly for all recs | Math invariant across multi-tool audit |

---

## Architecture Notes

- Tests import directly from `@/lib/auditEngine` via the Vitest path alias
- A `makeEntry()` helper reduces boilerplate — each test only specifies relevant fields
- Tests cover both the "happy path" (savings found) and "no-op path" (already optimal)
- No mocking needed — the audit engine is a pure function with no side effects
