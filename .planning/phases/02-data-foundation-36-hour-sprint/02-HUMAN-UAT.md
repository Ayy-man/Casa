---
status: partial
phase: 02-data-foundation-36-hour-sprint
source: [02-VERIFICATION.md]
started: 2026-05-21T00:00:00Z
updated: 2026-05-21T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Exception Board renders real Supabase data
expected: Navigating to `/` (logged in) shows the 7 seeded narrative exception cards urgency-sorted — NOT the "All clear." empty state — plus the "Pricing Week of" mega-card. Data comes from `getExceptions()`/`getPricingRecs()` against project `aqsitrzbjokkkpcohple`.
result: [pending]

### 2. Pricing Agent detail — Decisions + Activity show real rows
expected: `/vault/agent-logs/pricing` Decisions table and Activity feed render real `agent_logs`/`pricing_recs` rows (30 logs / 21 recs across 2 runs). At-a-Glance KPIs, Performance, Validation, Properties sections remain mock/math (D-15 scope).
result: [pending]

### 3. Studio-insert → page update (ROADMAP criterion 4)
expected: Inserting an `agent_logs` row for the pricing agent via Supabase Studio makes it appear in the Decisions table + Activity feed on `/vault/agent-logs/pricing` on next navigation.
result: [pending]

### 4. n8n Pricing workflow live run (ROADMAP criterion 5)
expected: Triggering n8n workflow `gIcYI8N1i1ljtCnW` (`fyi-media.app.n8n.cloud`, Supabase credential pointed at `aqsitrzbjokkkpcohple`) writes a complete `agent_runs` + `agent_logs` + `pricing_recs` trace; that trace surfaces on `/vault/agent-logs/pricing`. Deferred by operator decision to a post-push follow-up — code + schema are ready (Plan 02-03 Task 3 checkpoint).
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
