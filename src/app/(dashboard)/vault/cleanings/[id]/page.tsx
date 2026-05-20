"use client";

import { useRouter } from "next/navigation";
import { CLEANINGS_TODAY } from "@/lib/mock-data/cleanings";
import { VaultSheet, VaultNotFound } from "@/components/casa/vault-sheet";
import { cleaningDetail } from "@/lib/vault/detail";

/**
 * Vault › Cleanings › [id] — derived from the properties detail reference.
 * Renders the shared ~500px `.sheet--vault` side-sheet via VaultSheet.
 * The cleanings module exposes CLEANINGS_TODAY without a getX helper, so the
 * lookup is a local .find(); an unknown id still yields the not-found guard.
 * Threat T-01-09: the [id] param is never interpolated unsafely.
 */
export default function VaultCleaningDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const cleaning = CLEANINGS_TODAY.find((c) => c.id === params.id);

  if (!cleaning) {
    return (
      <VaultNotFound
        backHref="/vault/cleanings"
        backLabel="Back to Cleanings"
        heading="Not found."
        body="That turnover doesn’t exist or has been removed."
      />
    );
  }

  return (
    <div className="route-fade page-pad">
      <VaultSheet
        detail={cleaningDetail(cleaning)}
        onClose={() => router.push("/vault/cleanings")}
      />
    </div>
  );
}
