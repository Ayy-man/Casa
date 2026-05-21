/**
 * Data module: agent_logs.
 *
 * One of the eight DATA-06 data modules. Underscore filename mirrors the table
 * name (DATA-06 — intentionally breaks the repo's kebab-case mock-data
 * convention). See `exceptions.ts` for the full pattern rationale — this module
 * copies it:
 *
 *   • Supabase client mechanism (D-09): each function takes an optional
 *     `client: SupabaseClient<Database>`; when omitted it falls back to the
 *     browser-safe `createClient()`. RSC callers inject the server client.
 *   • snake_case ↔ camelCase boundary (D-10): a camelCase view `type` plus a
 *     `mapRow()` helper that maps every field explicitly. No type widening.
 *
 * The view type carries the fields the Pricing Agent detail Decisions table +
 * Activity feed render — time, property, action/reasoning, the `shadowMode`
 * flag that drives the Flagged/Logged status, and the run linkage.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

/** Generated row type — source of truth for the `agent_logs` table shape. */
type AgentLogRow = Database["public"]["Tables"]["agent_logs"]["Row"];

/**
 * camelCase view type for an agent log line. Field names feed the Pricing Agent
 * detail Decisions table + Activity feed. `shadowMode` drives the Flagged vs
 * Logged status semantics (D-14) — a shadow-mode log is a flagged suggestion,
 * not an executed action.
 */
export type AgentLog = {
  id: string;
  agentId: string | null;
  runId: string | null;
  propertyId: string | null;
  action: string | null;
  reasoning: string | null;
  /** True when the log was produced in shadow mode (suggestion, not action). */
  shadowMode: boolean;
  createdAt: string;
};

/** Map a generated snake_case row to the camelCase view type. */
function mapRow(row: AgentLogRow): AgentLog {
  return {
    id: row.id,
    agentId: row.agent_id,
    runId: row.run_id,
    propertyId: row.property_id,
    action: row.action,
    reasoning: row.reasoning,
    shadowMode: row.shadow_mode,
    createdAt: row.created_at,
  };
}

/**
 * Read an agent's logs, newest-first, optionally limited. `agentKey` is the
 * agent slug (DB `agents.id`) which is also the `agent_logs.agent_id` FK value.
 * Options-object signature per D-08.
 */
export async function getAgentLogs(
  { agentKey, limit }: { agentKey: string; limit?: number },
  client?: SupabaseClient<Database>,
): Promise<AgentLog[]> {
  const supabase = client ?? createClient();
  let query = supabase
    .from("agent_logs")
    .select("*")
    .eq("agent_id", agentKey)
    .order("created_at", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`getAgentLogs failed: ${error.message}`);
  }

  return (data ?? []).map(mapRow);
}
