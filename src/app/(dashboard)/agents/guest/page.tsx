import { redirect } from "next/navigation";

// Legacy route — relocated to /vault/agent-logs/guest (Phase 1 IA collapse).
// Redirect-stub keeps external deep links alive without a 404.
export default function LegacyGuestAgentRedirect() {
  redirect("/vault/agent-logs/guest");
}
