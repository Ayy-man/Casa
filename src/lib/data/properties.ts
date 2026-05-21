/**
 * Data module: properties.
 *
 * One of the eight DATA-06 data modules. Copies the pattern established in
 * `exceptions.ts`:
 *
 *   • Supabase client mechanism (D-09): each function takes an optional
 *     `client: SupabaseClient<Database>`; when omitted it falls back to the
 *     browser-safe `createClient()`. RSC callers inject the server client.
 *   • snake_case ↔ camelCase boundary (D-10): a camelCase view `type` plus a
 *     `mapRow()` helper that maps every field explicitly. No type widening.
 *
 * The view type mirrors the `Property` shape (`@/lib/mock-data/properties.ts`)
 * so the property grid and detail pages consume these rows unchanged.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

/** Generated row type — source of truth for the `properties` table shape. */
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

/**
 * camelCase view type for a property. Field names mirror the existing
 * `Property` shape (`@/lib/mock-data/properties.ts`) — `maxGuests`,
 * `ownerEmail`, `ownerPhone`, `commPref` — so consuming pages need no change.
 */
export type Property = {
  id: string;
  name: string;
  neighborhood: string;
  type: string;
  rate: number;
  status: string;
  sqft: number | null;
  beds: number | null;
  baths: number | null;
  maxGuests: number | null;
  owner: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  commPref: string | null;
  createdAt: string;
};

/** Map a generated snake_case row to the camelCase view type. */
function mapRow(row: PropertyRow): Property {
  return {
    id: row.id,
    name: row.name,
    neighborhood: row.neighborhood,
    type: row.type,
    rate: row.rate,
    status: row.status,
    sqft: row.sqft,
    beds: row.beds,
    baths: row.baths,
    maxGuests: row.max_guests,
    owner: row.owner,
    ownerEmail: row.owner_email,
    ownerPhone: row.owner_phone,
    commPref: row.comm_pref,
    createdAt: row.created_at,
  };
}

/**
 * Read a single property by id. Returns `null` when no property matches —
 * callers render a not-found state rather than throwing.
 */
export async function getProperty(
  id: string,
  client?: SupabaseClient<Database>,
): Promise<Property | null> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getProperty failed: ${error.message}`);
  }

  return data ? mapRow(data) : null;
}

/** Read the full 26-home portfolio, ordered by id. */
export async function listProperties(
  client?: SupabaseClient<Database>,
): Promise<Property[]> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`listProperties failed: ${error.message}`);
  }

  return (data ?? []).map(mapRow);
}
