import { redirect } from "next/navigation";

// Legacy route — superseded by /vault/properties (Phase 1 IA collapse).
// Redirect-stub keeps external deep links alive without a 404.
export default function LegacyPropertiesRedirect() {
  redirect("/vault/properties");
}
