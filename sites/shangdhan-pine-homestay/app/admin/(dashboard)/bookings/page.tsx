import { createClient } from "@/lib/supabase/server";
import { getAllBookings, BOOKING_STATUSES, type BookingStatus } from "@/lib/data/admin-bookings";
import { createSignedGuestDocumentUrl } from "@/lib/storage";
import { updateBookingStatusAction, markFrroSubmittedAction } from "./actions";

const inputClass =
  "mt-1.5 border border-border-default bg-warm-white px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-ink";
const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";

const STATUS_STYLE: Record<BookingStatus, string> = {
  AWAITING_UPI_RECONCILIATION: "bg-gold/15 text-gold-ink",
  CONFIRMED: "bg-forest/10 text-forest",
  CHECKED_IN: "bg-forest text-warm-white",
  CHECKED_OUT: "bg-sand-dark/40 text-text-secondary",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatInr(amount: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const bookings = await getAllBookings(supabase);

  const idProofUrls = new Map<string, string>();
  for (const booking of bookings) {
    const path = booking.booking_compliance?.id_proof_storage_path;
    if (path) {
      try {
        idProofUrls.set(booking.id, await createSignedGuestDocumentUrl(supabase, path));
      } catch {
        // Signed URL generation failing shouldn't take down the whole page --
        // the admin just won't see a working link for that one document.
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-text-primary">Bookings</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Requests submitted through /book. Verify the UPI transaction reference against your
          bank/UPI app before moving a booking to Confirmed.
        </p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-text-secondary">No bookings yet.</p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const nights = Math.max(
              1,
              Math.round(
                (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );
            const idProofUrl = idProofUrls.get(booking.id);
            const isForeign = booking.guest_nationality !== "Indian";

            return (
              <div key={booking.id} className="border border-border-default bg-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-xl text-text-primary">{booking.guest_name}</h2>
                      <span
                        className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${STATUS_STYLE[booking.status]}`}
                      >
                        {booking.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      {booking.guest_phone}
                      {booking.guest_email ? ` -- ${booking.guest_email}` : ""} -- {booking.guest_nationality}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {booking.check_in} to {booking.check_out} ({nights} night{nights > 1 ? "s" : ""}) --
                      requested {new Date(booking.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="font-display text-2xl text-text-primary">
                    {formatInr(booking.total_amount)}
                  </p>
                </div>

                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className={labelClass}>Rooms</p>
                    <ul className="mt-1.5 space-y-1 text-sm text-text-primary">
                      {booking.booking_items.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.room_name}
                          </span>
                          <span className="text-text-secondary">{formatInr(item.price_at_booking)}</span>
                        </li>
                      ))}
                    </ul>
                    {booking.booking_activities.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm text-text-primary">
                        {booking.booking_activities.map((activity) => (
                          <li key={activity.id} className="flex justify-between">
                            <span>{activity.activity_title}</span>
                            <span className="text-text-secondary">
                              {formatInr(activity.price_at_booking)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="mt-2 text-xs text-text-secondary">
                      UTR: <span className="text-text-primary">{booking.utr_number || "not provided"}</span>
                    </p>
                  </div>

                  <div>
                    <p className={labelClass}>Compliance</p>
                    {isForeign ? (
                      <div className="mt-1.5 space-y-1 text-sm text-text-primary">
                        <p>Passport: {booking.booking_compliance?.passport_number || "not provided"}</p>
                        <p>Visa: {booking.booking_compliance?.visa_number || "not provided"}</p>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-sm text-text-secondary">Indian guest -- no FRRO/Form-C needed.</p>
                    )}
                    {idProofUrl ? (
                      <a
                        href={idProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-gold-ink underline underline-offset-2 hover:text-text-primary"
                      >
                        View uploaded ID document
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-text-secondary">No ID document uploaded.</p>
                    )}
                    {isForeign ? (
                      <form
                        action={markFrroSubmittedAction.bind(
                          null,
                          booking.id,
                          !(booking.booking_compliance?.submitted_frro ?? false)
                        )}
                        className="mt-3"
                      >
                        <button
                          type="submit"
                          className="text-xs font-medium uppercase tracking-[0.1em] text-text-secondary hover:text-text-primary"
                        >
                          {booking.booking_compliance?.submitted_frro
                            ? "✓ Marked as submitted to FRRO"
                            : "Mark as submitted to FRRO"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await updateBookingStatusAction(
                      booking.id,
                      formData.get("status") as BookingStatus
                    );
                  }}
                  className="mt-5 flex items-center gap-3 border-t border-border-default pt-4"
                >
                  <label htmlFor={`status-${booking.id}`} className={labelClass}>
                    Status
                  </label>
                  <select
                    id={`status-${booking.id}`}
                    name="status"
                    defaultValue={booking.status}
                    className={inputClass}
                  >
                    {BOOKING_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="border border-charcoal/25 px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-text-primary hover:border-charcoal/50"
                  >
                    Update
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
