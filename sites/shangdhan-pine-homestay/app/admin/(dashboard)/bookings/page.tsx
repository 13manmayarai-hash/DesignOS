import { createClient } from "@/lib/supabase/server";
import { getAllBookings, BOOKING_STATUSES, type BookingStatus } from "@/lib/data/admin-bookings";
import { getAllInvoices } from "@/lib/data/invoices";
import { createSignedGuestDocumentUrl, createSignedInvoiceUrl } from "@/lib/storage";
import { SubmitButton } from "../_components/SubmitButton";
import { StampBadge } from "../_components/StampBadge";
import { updateBookingStatusAction, markFrroSubmittedAction, generateInvoiceAction } from "./actions";

const inputClass =
  "mt-1.5 border border-border-default bg-warm-white px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-ink";
const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";

const STATUS_TONE: Record<BookingStatus, "confirmed" | "pending" | "muted" | "void"> = {
  AWAITING_UPI_RECONCILIATION: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "confirmed",
  CHECKED_OUT: "muted",
  CANCELLED: "void",
};

// The linear path every booking follows, left to right. CANCELLED isn't in
// here -- it can branch off after any of these steps, so it's rendered
// separately as the tree's alternate ending rather than a fixed 5th step.
const TIMELINE_STEPS: { status: BookingStatus; label: string }[] = [
  { status: "AWAITING_UPI_RECONCILIATION", label: "Requested" },
  { status: "CONFIRMED", label: "Payment confirmed" },
  { status: "CHECKED_IN", label: "Checked in" },
  { status: "CHECKED_OUT", label: "Checked out" },
];

function formatInr(amount: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-IN");
}

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const [bookings, invoices] = await Promise.all([getAllBookings(supabase), getAllInvoices(supabase)]);
  const invoiceByBooking = new Map(invoices.map((invoice) => [invoice.booking_id, invoice]));

  const idProofUrls = new Map<string, string>();
  const invoiceUrls = new Map<string, string>();
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
    const invoice = invoiceByBooking.get(booking.id);
    if (invoice) {
      try {
        invoiceUrls.set(booking.id, await createSignedInvoiceUrl(supabase, invoice.pdf_storage_path));
      } catch {
        // Same as above -- a broken signed URL for one invoice shouldn't
        // take down the whole bookings page.
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

            // Events are already sorted oldest-first (see getAllBookings),
            // so this ends up holding the most recent timestamp per status.
            const eventTimeByStatus = new Map<BookingStatus, string>();
            for (const event of booking.booking_status_events) {
              eventTimeByStatus.set(event.status, event.created_at);
            }
            const invoice = invoiceByBooking.get(booking.id);
            const invoiceUrl = invoiceUrls.get(booking.id);
            const canInvoice =
              booking.status !== "AWAITING_UPI_RECONCILIATION" && booking.status !== "CANCELLED";
            const isCancelled = booking.status === "CANCELLED";
            const lastReachedIndex = TIMELINE_STEPS.reduce(
              (acc, step, i) => (eventTimeByStatus.has(step.status) ? i : acc),
              0
            );
            // Once cancelled, the tree branches off instead of continuing --
            // steps that were never going to happen aren't shown as pending.
            const visibleSteps = isCancelled
              ? TIMELINE_STEPS.slice(0, lastReachedIndex + 1)
              : TIMELINE_STEPS;
            const cancelledAt = eventTimeByStatus.get("CANCELLED");

            return (
              <div key={booking.id} className="ledger-panel">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-xl text-text-primary">{booking.guest_name}</h2>
                      <StampBadge tone={STATUS_TONE[booking.status]}>
                        {booking.status.replace(/_/g, " ")}
                      </StampBadge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-text-secondary">
                      {booking.guest_phone}
                      {booking.guest_email ? ` -- ${booking.guest_email}` : ""} -- {booking.guest_nationality}
                    </p>
                    <p className="mt-1 font-mono text-xs text-text-secondary">
                      {booking.check_in} to {booking.check_out} ({nights} night{nights > 1 ? "s" : ""}) --
                      requested {new Date(booking.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="font-mono text-2xl text-text-primary">
                    {formatInr(booking.total_amount)}
                  </p>
                </div>

                {/* Below sm: a plain vertical list with the timestamp always
                    visible -- hover doesn't work on a touchscreen, and a
                    horizontal tree has no room to breathe on a phone. */}
                <div className="mt-4 flex flex-col gap-2 sm:hidden">
                  {visibleSteps.map((step) => {
                    const reachedAt = eventTimeByStatus.get(step.status);
                    const reached = Boolean(reachedAt);
                    return (
                      <div key={step.status} className="flex items-center gap-2 text-xs">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            reached ? "bg-forest" : "bg-sand-dark/60"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            reached ? "text-text-primary" : "text-text-secondary/60"
                          }`}
                        >
                          {step.label}
                        </span>
                        {reached ? (
                          <span className="text-text-secondary">{formatTimestamp(reachedAt!)}</span>
                        ) : null}
                      </div>
                    );
                  })}
                  {isCancelled && cancelledAt ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-stamp-red" />
                      <span className="font-medium text-stamp-red">Cancelled</span>
                      <span className="text-text-secondary">{formatTimestamp(cancelledAt)}</span>
                    </div>
                  ) : null}
                </div>

                {/* sm and up: the connected tree, timestamp on hover. */}
                <div className="mt-4 hidden items-start sm:flex">
                  {visibleSteps.map((step, i) => {
                    const reachedAt = eventTimeByStatus.get(step.status);
                    const reached = Boolean(reachedAt);
                    const isLastVisible = i === visibleSteps.length - 1;
                    const showConnector = !isLastVisible || isCancelled;
                    const nextReached =
                      !isLastVisible && eventTimeByStatus.has(visibleSteps[i + 1].status);

                    return (
                      <div key={step.status} className="flex items-start">
                        <div className="flex w-20 flex-col items-center gap-1.5 text-center">
                          <span
                            title={
                              reached
                                ? `${step.label} -- ${formatTimestamp(reachedAt!)}`
                                : `${step.label} -- not yet`
                            }
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                              reached ? "bg-forest" : "bg-sand-dark/60"
                            }`}
                          />
                          <span
                            className={`text-[10px] uppercase leading-tight tracking-[0.06em] ${
                              reached ? "text-text-primary" : "text-text-secondary/60"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {showConnector ? (
                          <span
                            className={`mt-[5px] h-px w-8 shrink-0 ${
                              isLastVisible
                                ? "bg-stamp-red/40"
                                : nextReached
                                  ? "bg-forest"
                                  : "bg-sand-dark/60"
                            }`}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                  {isCancelled && cancelledAt ? (
                    <div className="flex w-20 flex-col items-center gap-1.5 text-center">
                      <span
                        title={`Cancelled -- ${formatTimestamp(cancelledAt)}`}
                        className="h-2.5 w-2.5 shrink-0 rounded-full bg-stamp-red"
                      />
                      <span className="text-[10px] uppercase leading-tight tracking-[0.06em] text-stamp-red">
                        Cancelled
                      </span>
                    </div>
                  ) : null}
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
                          <span className="font-mono text-text-secondary">
                            {formatInr(item.price_at_booking)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {booking.booking_activities.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm text-text-primary">
                        {booking.booking_activities.map((activity) => (
                          <li key={activity.id} className="flex justify-between">
                            <span>{activity.activity_title}</span>
                            <span className="font-mono text-text-secondary">
                              {formatInr(activity.price_at_booking)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="mt-2 text-xs text-text-secondary">
                      UTR:{" "}
                      <span className="font-mono text-text-primary">
                        {booking.utr_number || "not provided"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className={labelClass}>Compliance</p>
                    {isForeign ? (
                      <div className="mt-1.5 space-y-1 text-sm text-text-primary">
                        <p>Passport: {booking.booking_compliance?.passport_number || "not provided"}</p>
                        <p>Visa: {booking.booking_compliance?.visa_number || "not provided"}</p>
                        <p>
                          Arrived in India:{" "}
                          {booking.booking_compliance?.arrival_date_india || "not provided"}
                        </p>
                        <p>
                          Next destination:{" "}
                          {booking.booking_compliance?.next_destination || "not provided"}
                        </p>
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
                      <div className="mt-3 flex items-center gap-3">
                        {booking.booking_compliance?.submitted_frro ? (
                          <StampBadge tone="confirmed">Filed FRRO</StampBadge>
                        ) : null}
                        <form
                          action={markFrroSubmittedAction.bind(
                            null,
                            booking.id,
                            !(booking.booking_compliance?.submitted_frro ?? false)
                          )}
                        >
                          <button
                            type="submit"
                            className="text-xs font-medium uppercase tracking-[0.1em] text-text-secondary hover:text-text-primary"
                          >
                            {booking.booking_compliance?.submitted_frro
                              ? "Mark as not submitted"
                              : "Mark as submitted to FRRO"}
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border-default pt-4">
                  <p className={labelClass}>Invoice</p>
                  {invoice ? (
                    <>
                      <span className="font-mono text-sm text-text-primary">{invoice.invoice_number}</span>
                      {invoiceUrl ? (
                        <a
                          href={invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gold-ink underline underline-offset-2 hover:text-text-primary"
                        >
                          View PDF
                        </a>
                      ) : null}
                      <form action={generateInvoiceAction.bind(null, booking.id)}>
                        <SubmitButton
                          pendingLabel="Regenerating..."
                          className="text-xs font-medium uppercase tracking-[0.1em] text-text-secondary hover:text-text-primary"
                        >
                          Regenerate
                        </SubmitButton>
                      </form>
                    </>
                  ) : canInvoice ? (
                    <form action={generateInvoiceAction.bind(null, booking.id)}>
                      <SubmitButton
                        pendingLabel="Generating..."
                        className="border border-charcoal/25 px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-text-primary hover:border-charcoal/50"
                      >
                        Generate invoice
                      </SubmitButton>
                    </form>
                  ) : (
                    <span className="text-sm text-text-secondary">
                      Available once payment is confirmed.
                    </span>
                  )}
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
