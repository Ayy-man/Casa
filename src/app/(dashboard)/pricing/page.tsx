import { redirect } from "next/navigation";

// Legacy route — the standalone Pricing Approval Queue is retired. Its
// 26-row bulk-approve table is now the "Pricing Week of" mega-card
// side-sheet on the Exception Board (Phase 1 IA collapse). Redirect-stub
// keeps external deep links alive without a 404.
export default function LegacyPricingRedirect() {
  redirect("/");
}
