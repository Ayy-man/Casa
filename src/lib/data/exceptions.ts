/**
 * Data module: exceptions.
 *
 * One of the eight DATA-06 data modules. These modules replace
 * `src/lib/mock-data/*` as the entity-data import seam — async functions that
 * read from real Supabase and return rows typed from the generated `Database`
 * type (`src/types/database.types.ts`). No unchecked type widening (D-10).
 *
 * ── Supabase client mechanism (D-09 — isomorphic, no `'server-only'`) ──
 * Each exported function accepts an OPTIONAL `client` parameter typed
 * `SupabaseClient<Database>`. When omitted it falls back to `createClient()`
 * from `@/utils/supabase/client.ts` (the browser-safe client, which takes no
 * args). RSC server components in Plan 03 pass the server client explicitly
 * (`createClient(cookieStore)` from `@/utils/supabase/server.ts`). This
 * injected-param approach sidesteps the factory asymmetry — the function does
 * not need to know whether it runs on the server or in the browser.
 *
 * ── snake_case ↔ camelCase boundary (D-10) ──
 * DB columns are snake_case; the app's existing component props are camelCase
 * (`ExceptionItem` in `src/lib/mock-data/exceptions.ts`). Each module exports a
 * camelCase view `type` and a `mapRow()` helper that maps every field
 * explicitly — no type widening. Rows leaving the module match the shapes the
 * existing components (`ExceptionCard`, `PricingMegaCard`) already consume, so
 * Plan 03's page diffs swap the import source, not the data flow.
 *
 * Pure rendering helpers (`URGENCY_RANK`, etc.) stay in `@/lib/mock-data/*` —
 * they are view logic, not data, and are NOT re-exported here.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

/** Generated row type — the source of truth for the `exceptions` table shape. */
type ExceptionRow = Database["public"]["Tables"]["exceptions"]["Row"];

/** Constrained urgency union — mirrors `mock-data/exceptions.ts` `Urgency`. */
export type ExceptionUrgency = "Critical" | "High" | "Medium" | "Low";

/**
 * camelCase view type for an exception row. Field names mirror the existing
 * `ExceptionItem` shape (`@/lib/mock-data/exceptions.ts`) so the `ExceptionCard`
 * component and the Pricing mega-card consume these rows without any change.
 * `id` is the DB uuid string (the legacy mock `ExceptionItem.id` was a number;
 * the redesigned board keys on the uuid).
 */
export type Exception = {
  id: string;
  propertyId: string | null;
  /** Machine type — `pricing_week` is the portfolio mega-card. */
  type: string | null;
  typeLabel: string | null;
  urgency: ExceptionUrgency | null;
  category: string | null;
  agent: string | null;
  summary: string | null;
  /** The italic `Suggested:` block body. */
  suggested: string | null;
  /** Source-attribution footer text. */
  source: string | null;
  /** Lifecycle state — open / claimed / executed. */
  state: string;
  claimedBy: string | null;
  claimedAt: string | null;
  executedAt: string | null;
  createdAt: string;
};

/** Urgency sort rank — Critical first. Mirrors `mock-data` `URGENCY_RANK`. */
const URGENCY_RANK: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/** Map a generated snake_case row to the camelCase view type. */
function mapRow(row: ExceptionRow): Exception {
  return {
    id: row.id,
    propertyId: row.property_id,
    type: row.type,
    typeLabel: row.type_label,
    urgency: (row.urgency as ExceptionUrgency | null) ?? null,
    category: row.category,
    agent: row.agent,
    summary: row.summary,
    suggested: row.suggested,
    source: row.source,
    state: row.state,
    claimedBy: row.claimed_by,
    claimedAt: row.claimed_at,
    executedAt: row.executed_at,
    createdAt: row.created_at,
  };
}

/**
 * Read every exception, urgency-sorted (Critical → Low). The Exception Board
 * RSC shell calls this; the returned shape feeds `ExceptionCard` and the
 * `pricing_week`-typed row that renders as the portfolio mega-card.
 */
export async function getExceptions(
  client?: SupabaseClient<Database>,
): Promise<Exception[]> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from("exceptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`getExceptions failed: ${error.message}`);
  }

  return (data ?? []).map(mapRow).sort((a, b) => {
    const rankA = a.urgency ? URGENCY_RANK[a.urgency] ?? 99 : 99;
    const rankB = b.urgency ? URGENCY_RANK[b.urgency] ?? 99 : 99;
    return rankA - rankB;
  });
}
