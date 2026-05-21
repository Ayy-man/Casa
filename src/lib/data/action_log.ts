/**
 * Data module: action_log.
 *
 * One of the eight DATA-06 data modules. Underscore filename mirrors the table
 * name (DATA-06). Built to the same standard as the critical-path modules even
 * though it has no path-to-paint consumer until Phase 3 (D-11 —
 * build-but-don't-consume). Copies the pattern established in `exceptions.ts`:
 *
 *   • Supabase client mechanism (D-09): each function takes an optional
 *     `client: SupabaseClient<Database>`; when omitted it falls back to the
 *     browser-safe `createClient()`. RSC callers inject the server client.
 *   • snake_case ↔ camelCase boundary (D-10): a camelCase view `type` plus a
 *     `mapRow()` helper that maps every field explicitly. No type widening.
 *
 * `action_log` is the operator-action audit trail — every dashboard action
 * routed through `/api/actions/*` (Phase 3) appends a row here.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

/** Generated row type — source of truth for the `action_log` table shape. */
type ActionLogRow = Database["public"]["Tables"]["action_log"]["Row"];

/**
 * camelCase view type for an action-log entry. `detail` keeps the generated
 * `Json` type — it is a free-form payload column, not a fixed shape.
 */
export type ActionLogEntry = {
  id: string;
  entityType: string | null;
  entityId: string | null;
  action: string | null;
  actor: string | null;
  /** UNIQUE idempotency key — dedupes replayed action requests. */
  idempotencyKey: string | null;
  detail: Json | null;
  executedAt: string | null;
  createdAt: string;
};

/** Map a generated snake_case row to the camelCase view type. */
function mapRow(row: ActionLogRow): ActionLogEntry {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    actor: row.actor,
    idempotencyKey: row.idempotency_key,
    detail: row.detail,
    executedAt: row.executed_at,
    createdAt: row.created_at,
  };
}

/**
 * Read the action-log entries for one entity, newest-first. Both `entityType`
 * and `entityId` are required filter args, passed as an options object per
 * D-08 — Supabase's query builder parameterizes them (no SQL-injection
 * surface, threat T-02-05).
 */
export async function getActionLog(
  { entityType, entityId }: { entityType: string; entityId: string },
  client?: SupabaseClient<Database>,
): Promise<ActionLogEntry[]> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from("action_log")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`getActionLog failed: ${error.message}`);
  }

  return (data ?? []).map(mapRow);
}
