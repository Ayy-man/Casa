import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { getExceptions } from "@/lib/data/exceptions";
import { getPricingRecs } from "@/lib/data/pricing_recs";
import { listProperties } from "@/lib/data/properties";
import { ExceptionBoardClient } from "./_exception-board/exception-board-client";

/**
 * Exception Board — the Casa 360 home route `/`.
 *
 * RSC server shell (D-12 — the RSC server-shell + client-island split, the
 * single biggest new pattern this phase). This file is an `async` server
 * component: it builds the per-request Supabase SSR client via `cookies()`
 * from `next/headers`, fetches real data, and hands it to the
 * `ExceptionBoardClient` island, which holds ALL interactivity.
 *
 * Why a server shell: it removes the skeleton flash on Carlos's 5-10x/day
 * entry point (Pitfall 13) and is the first end-to-end exercise of the SSR
 * cookie-handler shape (validates DATA-08). No `useState`/`useEffect`/`useMemo`
 * here — those all live in the client island.
 *
 * Data sources:
 *  • `getExceptions()`     — the urgency-sorted exception stack (incl. the
 *                            `pricing_week` portfolio mega-card).
 *  • `getPricingRecs()`    — the 26-row Pricing side-sheet table.
 *  • `listProperties()`    — resolves each exception/pricing `property_id` to
 *                            a display name + neighborhood (the `exceptions` /
 *                            `pricing_recs` tables carry only the FK).
 */
export default async function ExceptionBoardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch in parallel — three independent reads against the same client.
  const [exceptions, pricingRecs, properties] = await Promise.all([
    getExceptions(supabase),
    getPricingRecs({}, supabase),
    listProperties(supabase),
  ]);

  return (
    <ExceptionBoardClient
      exceptions={exceptions}
      pricingRecs={pricingRecs}
      properties={properties}
    />
  );
}
