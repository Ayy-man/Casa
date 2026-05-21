/**
 * Data module: bookings.
 *
 * One of the eight DATA-06 data modules. Built to the same standard as the
 * critical-path modules even though it has no path-to-paint consumer until
 * Phase 5 (D-11 — build-but-don't-consume). Copies the pattern established in
 * `exceptions.ts`:
 *
 *   • Supabase client mechanism (D-09): each function takes an optional
 *     `client: SupabaseClient<Database>`; when omitted it falls back to the
 *     browser-safe `createClient()`. RSC callers inject the server client.
 *   • snake_case ↔ camelCase boundary (D-10): a camelCase view `type` plus a
 *     `mapRow()` helper that maps every field explicitly. No type widening.
 *
 * The view type reflects what the live `bookings` table carries. The legacy
 * mock `Booking` shape (`@/lib/mock-data/bookings.ts`) carried denormalised
 * fields (`guest` name, `fees`, `taxes`, `lastMsg`) that are not columns on the
 * real table — the live schema normalises the guest into `guest_id` and tracks
 * a single `total_amount`. Phase 5's booking page wires the join when needed.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

/** Generated row type — source of truth for the `bookings` table shape. */
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

/**
 * camelCase view type for a booking. Field names mirror `Booking`
 * (`@/lib/mock-data/bookings.ts`) where columns exist on the live table;
 * `guestId` / `totalAmount` / `nights` / `guestsCount` reflect the normalised
 * live schema.
 */
export type Booking = {
  id: string;
  propertyId: string | null;
  guestId: string | null;
  channel: string | null;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
  guestsCount: number | null;
  totalAmount: number | null;
  createdAt: string;
};

/** Map a generated snake_case row to the camelCase view type. */
function mapRow(row: BookingRow): Booking {
  return {
    id: row.id,
    propertyId: row.property_id,
    guestId: row.guest_id,
    channel: row.channel,
    status: row.status,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: row.nights,
    guestsCount: row.guests_count,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
  };
}

/**
 * Read a single booking by id. Returns `null` when no booking matches —
 * callers render a not-found state rather than throwing.
 */
export async function getBooking(
  id: string,
  client?: SupabaseClient<Database>,
): Promise<Booking | null> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getBooking failed: ${error.message}`);
  }

  return data ? mapRow(data) : null;
}
