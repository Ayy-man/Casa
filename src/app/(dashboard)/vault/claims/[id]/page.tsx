"use client";

import { useRouter } from "next/navigation";
import { CLAIMS } from "@/lib/mock-data/claims";
import { VaultSheet, VaultNotFound } from "@/components/casa/vault-sheet";
import { claimDetail } from "@/lib/vault/detail";

/**
 * Vault › Claims › [id] — derived from the properties detail reference.
 * Renders the shared ~500px `.sheet--vault` side-sheet via VaultSheet. Only
 * pending claims carry the full PendingClaim shape the detail builder needs,
 * so the lookup targets CLAIMS.pending; submitted/resolved ids resolve to the
 * not-found guard. Threat T-01-09: the [id] param is never interpolated
 * unsafely.
 */
export default function VaultClaimDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const claim = CLAIMS.pending.find((c) => c.id === params.id);

  if (!claim) {
    return (
      <VaultNotFound
        backHref="/vault/claims"
        backLabel="Back to Claims"
        heading="Not found."
        body="That claim doesn’t exist or has been removed."
      />
    );
  }

  return (
    <div className="route-fade page-pad">
      <VaultSheet
        detail={claimDetail(claim)}
        onClose={() => router.push("/vault/claims")}
      />
    </div>
  );
}
