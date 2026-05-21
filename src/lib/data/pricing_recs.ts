/**
 * Data module: pricing_recs.
 *
 * One of the eight DATA-06 data modules. See `exceptions.ts` for the full
 * pattern rationale — this module copies it:
 *
 *   • Supabase client mechanism (D-09): each function takes an optional
 *     `client: SupabaseClient<Database>`; when omitted it falls back to the
 *     browser-safe `createClient()`. RSC callers inject the server client.
 *   • snake_case ↔ camelCase boundary (D-10): a camelCase view `type` plus a
 *     `mapRow()` helper that maps every field explicitly. No type widening.
 *
 * The view type mirrors `PricingRow` (`@/lib/mock-data/pricing.ts`) — the shape
 * the Pricing Agent detail Decisions table renders — plus the `status`
 * lifecycle field the Decisions-table status semantics need.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

/** Generated row type — source of truth for the `pricing_recs` table shape. */
type PricingRecRow = Database["public"]["Tables"]["pricing_recs"]["Row"];

/**
 * camelCase view type for a pricing recommendation. Field names mirror the
 * existing `PricingRow` shape (`current`, `recommended`, `change`, `reasoning`)
 * so the Pricing Agent Decisions table consumes these rows unchanged, with the
 * `status` lifecycle column added for the Decisions-table status semantics.
 */
export type PricingRec = {
  id: string;
  propertyId: string | null;
  runId: string | null;
  weekStart: string | null;
  /** Current nightly rate (DB `current_rate`). */
  current: number | null;
  /** Recommended nightly rate (DB `recommended_rate`). */
  recommended: number | null;
  /** Percentage delta (DB `change_pct`). */
  change: number | null;
  reasoning: string | null;
  /** Lifecycle status — pending / accepted / rejected. */
  status: string;
  executedAt: string | null;
  createdAt: string;
};

/** Map a generated snake_case row to the camelCase view type. */
function mapRow(row: PricingRecRow): PricingRec {
  return {
    id: row.id,
    propertyId: row.property_id,
    runId: row.run_id,
    weekStart: row.week_start,
    current: row.current_rate,
    recommended: row.recommended_rate,
    change: row.change_pct,
    reasoning: row.reasoning,
    status: row.status,
    executedAt: row.executed_at,
    createdAt: row.created_at,
  };
}

/**
 * Read pricing recommendations, newest-first. When `weekStart` is supplied the
 * result is filtered to that week (`week_start` equality). Returns the pricing
 * table the Pricing Agent detail page renders.
 */
export async function getPricingRecs(
  { weekStart }: { weekStart?: string } = {},
  client?: SupabaseClient<Database>,
): Promise<PricingRec[]> {
  const supabase = client ?? createClient();
  let query = supabase
    .from("pricing_recs")
    .select("*")
    .order("created_at", { ascending: false });

  if (weekStart) {
    query = query.eq("week_start", weekStart);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`getPricingRecs failed: ${error.message}`);
  }

  return (data ?? []).map(mapRow);
}
