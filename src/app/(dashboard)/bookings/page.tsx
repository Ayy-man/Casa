import { redirect } from "next/navigation";

// Legacy route — superseded by /vault/bookings (Phase 1 IA collapse).
// Redirect-stub keeps external deep links alive without a 404.
export default function LegacyBookingsRedirect() {
  redirect("/vault/bookings");
}
