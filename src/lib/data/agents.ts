/**
 * Data module: agents.
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
 * The view type mirrors the `AgentSummary` shape (`@/lib/mock-data/agents.ts`)
 * for the fields the DB actually carries — the live `agents` table holds
 * identity + mode only; the KPI fields (`actionsToday`, `success`, etc.) are
 * derived/mock and stay in mock-data per D-15.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

/** Generated row type — source of truth for the `agents` table shape. */
type AgentRow = Database["public"]["Tables"]["agents"]["Row"];

/**
 * camelCase view type for an agent. Field names mirror `AgentSummary`
 * (`@/lib/mock-data/agents.ts`) for the persisted columns. `key` is the agent
 * primary key (DB `id` — a slug such as `pricing` / `guest` / `ops` / `sop`).
 */
export type Agent = {
  /** Agent slug primary key — `pricing` | `guest` | `ops` | `sop`. */
  key: string;
  name: string;
  tagline: string | null;
  /** Operating mode — `shadow` / `live` (seeded `shadow` this milestone). */
  mode: string;
  createdAt: string;
};

/** Map a generated snake_case row to the camelCase view type. */
function mapRow(row: AgentRow): Agent {
  return {
    key: row.id,
    name: row.name,
    tagline: row.tagline,
    mode: row.mode,
    createdAt: row.created_at,
  };
}

/**
 * Read a single agent by its slug key (DB `id`). Returns `null` when no agent
 * matches — callers render a not-found state rather than throwing.
 */
export async function getAgent(
  key: string,
  client?: SupabaseClient<Database>,
): Promise<Agent | null> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", key)
    .maybeSingle();

  if (error) {
    throw new Error(`getAgent failed: ${error.message}`);
  }

  return data ? mapRow(data) : null;
}
