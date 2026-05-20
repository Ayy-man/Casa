"use client";

import { useRouter } from "next/navigation";
import { getBooking } from "@/lib/mock-data/bookings";
import { VaultSheet, VaultNotFound } from "@/components/casa/vault-sheet";
import { bookingDetail } from "@/lib/vault/detail";

/**
 * Vault › Bookings › [id] — derived from the properties detail reference.
 * Renders the shared ~500px `.sheet--vault` side-sheet via VaultSheet.
 * Threat T-01-09: getBooking() returns undefined for unknown ids; the
 * not-found guard renders the "Not found." state gracefully.
 */
export default function VaultBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const booking = getBooking(params.id);

  if (!booking) {
    return (
      <VaultNotFound
        backHref="/vault/bookings"
        backLabel="Back to Bookings"
        heading="Not found."
        body="That booking doesn’t exist or has been removed."
      />
    );
  }

  return (
    <div className="route-fade page-pad">
      <VaultSheet
        detail={bookingDetail(booking)}
        onClose={() => router.push("/vault/bookings")}
      />
    </div>
  );
}
