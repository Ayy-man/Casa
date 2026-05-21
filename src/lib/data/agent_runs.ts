/**
 * Data module: agent_runs.
 *
 * One of the eight DATA-06 data modules. Underscore filename mirrors the table
 * name (DATA-06). Copies the pattern established in `exceptions.ts`:
 *
 *   • Supabase client mechanism (D-09): each function takes an optional
 *     `client: SupabaseClient<Database>`; when omitted it falls back to the
 *     browser-safe `createClient()`. RSC callers inject the server client.
 *   • snake_case ↔ camelCase boundary (D-10): a camelCase view `type` plus a
 *     `mapRow()` helper that maps every field explicitly. No type widening.
 *
 * `agent_runs` is the n8n-write target table — the Pricing workflow
 * `gIcYI8N1i1ljtCnW` writes a row here per run. This read shape accepts every
 * column that workflow populates: idempotency key, status, mode-at-run,
 * trigger, and the started/expected-callback/completed timestamp trio.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

/** Generated row type — source of truth for the `agent_runs` table shape. */
type AgentRunRow = Database["public"]["Tables"]["agent_runs"]["Row"];

/**
 * camelCase view type for an agent run. Mirrors every `agent_runs` column so a
 * consumer can render the full run lifecycle (the n8n Pricing workflow writes
 * all of these).
 */
export type AgentRun = {
  id: string;
  agentId: string | null;
  /** UNIQUE idempotency key — dedupes repeated n8n callbacks. */
  idempotencyKey: string | null;
  status: string;
  /** Agent mode captured at run time — `shadow` / `live`. */
  modeAtRun: string | null;
  trigger: string | null;
  startedAt: string | null;
  expectedCallbackBy: string | null;
  completedAt: string | null;
  createdAt: string;
};

/** Map a generated snake_case row to the camelCase view type. */
function mapRow(row: AgentRunRow): AgentRun {
  return {
    id: row.id,
    agentId: row.agent_id,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    modeAtRun: row.mode_at_run,
    trigger: row.trigger,
    startedAt: row.started_at,
    expectedCallbackBy: row.expected_callback_by,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

/**
 * Read an agent's runs, newest-first. `agentKey` is the agent slug
 * (DB `agents.id`) which is also the `agent_runs.agent_id` FK value.
 * Options-object signature per D-08.
 */
export async function getAgentRuns(
  { agentKey }: { agentKey: string },
  client?: SupabaseClient<Database>,
): Promise<AgentRun[]> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("agent_id", agentKey)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`getAgentRuns failed: ${error.message}`);
  }

  return (data ?? []).map(mapRow);
}
