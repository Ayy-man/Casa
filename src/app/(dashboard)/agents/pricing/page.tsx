import { redirect } from "next/navigation";

// Legacy route — relocated to /vault/agent-logs/pricing (Phase 1 IA
// collapse). Redirect-stub keeps external deep links alive without a 404.
export default function LegacyPricingAgentRedirect() {
  redirect("/vault/agent-logs/pricing");
}
