"use client";

import { useRouter } from "next/navigation";
import { getOwner } from "@/lib/mock-data/owners";
import { VaultSheet, VaultNotFound } from "@/components/casa/vault-sheet";
import { ownerDetail } from "@/lib/vault/detail";

/**
 * Vault › Owners › [id] — derived from the properties detail reference.
 * Renders the shared ~500px `.sheet--vault` side-sheet via VaultSheet.
 * Threat T-01-09: getOwner() returns undefined for unknown ids; the not-found
 * guard renders the "Not found." state gracefully.
 */
export default function VaultOwnerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const owner = getOwner(params.id);

  if (!owner) {
    return (
      <VaultNotFound
        backHref="/vault/owners"
        backLabel="Back to Owners"
        heading="Not found."
        body="That owner doesn’t exist or has been removed."
      />
    );
  }

  return (
    <div className="route-fade page-pad">
      <VaultSheet
        detail={ownerDetail(owner)}
        onClose={() => router.push("/vault/owners")}
      />
    </div>
  );
}
