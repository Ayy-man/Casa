import { redirect } from "next/navigation";

// Legacy route — superseded by /vault/cleanings (Phase 1 IA collapse).
// Redirect-stub keeps external deep links alive without a 404.
export default function LegacyCleaningsRedirect() {
  redirect("/vault/cleanings");
}
