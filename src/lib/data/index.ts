/**
 * Barrel for the eight DATA-06 Supabase data modules.
 *
 * Mirrors `src/lib/mock-data/index.ts` so Plan 03's page migrations can switch
 * a single import path. Consumers may import from this barrel when pulling
 * from multiple modules, or directly from a file for a single module.
 *
 * Every getter is an async Supabase read returning rows typed from the
 * generated `Database` type. Pure rendering helpers stay in `@/lib/mock-data/*`
 * — they are not re-exported here.
 */

export * from "./properties";
export * from "./bookings";
export * from "./agents";
export * from "./agent_runs";
export * from "./agent_logs";
export * from "./pricing_recs";
export * from "./exceptions";
export * from "./action_log";
