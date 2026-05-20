"use client";

import { useRouter } from "next/navigation";
import { getProperty } from "@/lib/mock-data/properties";
import { VaultSheet, VaultNotFound } from "@/components/casa/vault-sheet";
import { propertyDetail } from "@/lib/vault/detail";

/**
 * Vault › Properties › [id] — REFERENCE detail route. The other 4 [id] routes
 * derive from this one (swap getX + detail builder + parent path).
 *
 * Threat T-01-09: the [id] param is untrusted; getProperty() returns undefined
 * for any unknown/malformed id and the not-found guard renders gracefully —
 * the param is never interpolated into HTML, a query, or a redirect target.
 *
 * The route renders the SAME VaultSheet a table row click opens — the
 * ~500px `.sheet--vault` side-sheet; closing it navigates back to the parent
 * /vault/properties table so the surface is consistent across both entry
 * points.
 */
export default function VaultPropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const property = getProperty(params.id);

  if (!property) {
    return (
      <VaultNotFound
        backHref="/vault/properties"
        backLabel="Back to Properties"
        heading="Not found."
        body="That property doesn’t exist or has been removed."
      />
    );
  }

  return (
    <div className="route-fade page-pad">
      <VaultSheet
        detail={propertyDetail(property)}
        onClose={() => router.push("/vault/properties")}
      />
    </div>
  );
}
