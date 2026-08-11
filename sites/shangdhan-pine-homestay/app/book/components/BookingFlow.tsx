"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import type { Room } from "@/lib/data/rooms";
import type { Activity } from "@/lib/data/activities";
import { calculateHospitalityGst, GST_STATE_OPTIONS, PROPERTY_GST_STATE_CODE } from "@/lib/gst";
import { nightsBetween } from "@/lib/dates";
import { property, upiId, upiPayeeName, isGstCompliant, whatsappLink } from "@/lib/property-config";
import { submitBookingAction } from "../actions";

const STEPS = ["Trip & guests", "Compliance", "Payment"] as const;

const inputClass =
  "mt-1.5 w-full border border-border-default bg-warm-white px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-gold-ink";
const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";

export function BookingFlow({ rooms, activities }: { rooms: Room[]; activities: Activity[] }) {
  const bookableRooms = rooms.filter((r) => r.rent_amount !== null);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(new Set());

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [nationality, setNationality] = useState<"Indian" | "Foreign national">("Indian");
  const [guestStateCode, setGuestStateCode] = useState(PROPERTY_GST_STATE_CODE);

  const [passportNumber, setPassportNumber] = useState("");
  const [visaNumber, setVisaNumber] = useState("");
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  const [utrNumber, setUtrNumber] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  const isForeign = nationality !== "Indian";
  const nights = nightsBetween(checkIn, checkOut);

  const roomSelections = useMemo(
    () =>
      bookableRooms
        .filter((r) => (roomQuantities[r.id] ?? 0) > 0)
        .map((r) => {
          const quantity = roomQuantities[r.id] ?? 0;
          const perNight = r.rent_unit.toLowerCase().includes("night");
          const priceAtBooking = (r.rent_amount ?? 0) * quantity * (perNight ? nights : 1);
          return { roomId: r.id, roomName: r.name, quantity, priceAtBooking };
        }),
    [bookableRooms, roomQuantities, nights]
  );

  const activitySelections = useMemo(
    () =>
      activities
        .filter((a) => selectedActivityIds.has(a.id))
        .map((a) => ({ activityId: a.id, activityTitle: a.title, priceAtBooking: a.price })),
    [activities, selectedActivityIds]
  );

  const accommodationTotal = roomSelections.reduce((sum, r) => sum + r.priceAtBooking, 0);
  const activitiesTotal = activitySelections.reduce((sum, a) => sum + a.priceAtBooking, 0);
  const gst = calculateHospitalityGst({
    accommodationTotal,
    activitiesTotal,
    isGstCompliant,
    guestStateCode: isForeign ? "" : guestStateCode,
  });

  const canShowQr = Boolean(upiId) && gst.total > 0;

  useEffect(() => {
    if (!canShowQr) return;
    const uri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      upiPayeeName
    )}&am=${gst.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Booking - ${property.name}`)}`;
    let cancelled = false;
    QRCode.toDataURL(uri, { margin: 1, width: 220 }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [canShowQr, gst.total]);

  const step1Valid =
    checkIn && checkOut && roomSelections.length > 0 && guestName.trim() && guestPhone.trim();
  const step2Valid = idProofFile !== null && (!isForeign || (passportNumber.trim() && visaNumber.trim()));

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    // Open the tab synchronously, on the click itself, before any `await`.
    // Opening it *after* an await is what browsers block as a popup, since
    // it's no longer inside the direct user-gesture window -- that's the
    // most likely reason this looked "stuck" with nothing happening. Can't
    // use noopener here: it makes the returned window reference null, and
    // we need that reference to navigate the tab once the booking is saved.
    const whatsappTab = window.open("", "_blank");

    const formData = new FormData();
    formData.set("guestName", guestName);
    formData.set("guestPhone", guestPhone);
    formData.set("guestEmail", guestEmail);
    formData.set("guestNationality", nationality);
    formData.set("guestStateCode", isForeign ? "" : guestStateCode);
    formData.set("checkIn", checkIn);
    formData.set("checkOut", checkOut);
    formData.set("roomSelections", JSON.stringify(roomSelections));
    formData.set("activitySelections", JSON.stringify(activitySelections));
    formData.set("accommodationTotal", String(accommodationTotal));
    formData.set("activitiesTotal", String(activitiesTotal));
    formData.set("cgstAmount", String(gst.cgst));
    formData.set("sgstAmount", String(gst.sgst));
    formData.set("igstAmount", String(gst.igst));
    formData.set("totalAmount", String(gst.total));
    formData.set("utrNumber", utrNumber);
    formData.set("passportNumber", passportNumber);
    formData.set("visaNumber", visaNumber);
    if (idProofFile) formData.set("idProofFile", idProofFile);

    const res = await submitBookingAction(formData);
    setSubmitting(false);

    if (!res.ok) {
      whatsappTab?.close();
      setError(res.error);
      return;
    }

    const roomsSummary = roomSelections.map((r) => `${r.quantity}x ${r.roomName}`).join(", ");
    const activitiesSummary = activitySelections.map((a) => a.activityTitle).join(", ") || "None";
    const message = [
      `New booking request -- ${property.name}`,
      `Guest: ${guestName}`,
      `Phone: ${guestPhone}`,
      `Nationality: ${nationality}`,
      `Dates: ${checkIn} to ${checkOut} (${nights} night${nights > 1 ? "s" : ""})`,
      `Rooms: ${roomsSummary}`,
      `Activities: ${activitiesSummary}`,
      `Total payable: Rs ${gst.total.toFixed(2)}`,
      `UPI transaction ref (UTR): ${utrNumber}`,
      `ID proof: ${idProofFile ? "uploaded" : "not uploaded"}`,
    ].join("\n");

    const link = whatsappLink(message);
    if (link && whatsappTab) {
      whatsappTab.location.href = link;
      setWhatsappOpened(true);
    } else {
      whatsappTab?.close();
      setWhatsappOpened(false);
    }

    setConfirmedBookingId(res.bookingId);
    setConfirmationEmailSent(res.emailSent);
  }

  if (confirmedBookingId) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-3xl text-forest">
          &#10003;
        </div>
        <h1 className="mt-6 font-display text-3xl text-text-primary">Booking request sent.</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Reference <span className="font-medium text-text-primary">#{confirmedBookingId.slice(0, 8).toUpperCase()}</span>{" "}
          -- {checkIn} to {checkOut}, &#8377;{gst.total.toFixed(2)} total.
        </p>

        <div className="mt-8 border border-border-default bg-surface p-6 text-left text-sm text-text-secondary">
          {whatsappOpened ? (
            <p>
              We opened WhatsApp in a new tab with your booking details filled in -- send that
              message to confirm with the host. If the tab didn&apos;t open (some browsers block
              it), message them directly instead.
            </p>
          ) : (
            <p>
              Your booking is saved, but we couldn&apos;t open WhatsApp automatically -- please
              message the host directly to confirm your dates.
            </p>
          )}
          <p className="mt-3">
            The host will confirm your dates once they&apos;ve verified the UPI payment against
            the transaction reference you provided.
          </p>
          {guestEmail ? (
            <p className="mt-3">
              {confirmationEmailSent
                ? `A copy of this confirmation was emailed to ${guestEmail}.`
                : `We couldn't send a confirmation email to ${guestEmail} -- the details above are what matters.`}
            </p>
          ) : null}
        </div>

        <Link
          href="/"
          className="mt-8 inline-block border border-charcoal/25 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-text-primary hover:border-charcoal/50"
        >
          Back to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_360px]">
      <section className="space-y-8">
        <div className="flex items-center justify-between border border-border-default bg-surface px-5 py-4">
          <div className="flex gap-6 text-xs font-medium uppercase tracking-[0.12em]">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={
                  step === i + 1
                    ? "border-b-2 border-gold pb-1 text-text-primary"
                    : "text-text-secondary"
                }
              >
                {i + 1}. {label}
              </span>
            ))}
          </div>
          <span className="text-xs text-text-secondary">Step {step} of 3</span>
        </div>

        {step === 1 ? (
          <div className="space-y-8 border border-border-default bg-surface p-6">
            <div>
              <h2 className="font-display text-2xl text-text-primary">Trip dates</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkIn" className={labelClass}>Check-in</label>
                  <input
                    id="checkIn"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkOut" className={labelClass}>Check-out</label>
                  <input
                    id="checkOut"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-text-primary">Rooms</h2>
              {bookableRooms.length === 0 ? (
                <p className="mt-3 text-sm text-text-secondary">
                  No rooms with confirmed pricing yet -- check back soon, or message us on WhatsApp
                  directly.
                </p>
              ) : (
                <div className="mt-4 divide-y divide-border-default border-y border-border-default">
                  {bookableRooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{room.name}</p>
                        <p className="text-xs text-text-secondary">
                          &#8377;{new Intl.NumberFormat("en-IN").format(room.rent_amount ?? 0)}{" "}
                          {room.rent_unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setRoomQuantities((q) => ({
                              ...q,
                              [room.id]: Math.max(0, (q[room.id] ?? 0) - 1),
                            }))
                          }
                          className="h-8 w-8 border border-border-default text-text-secondary hover:border-charcoal/40"
                        >
                          &minus;
                        </button>
                        <span className="w-6 text-center text-sm">{roomQuantities[room.id] ?? 0}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setRoomQuantities((q) => ({ ...q, [room.id]: (q[room.id] ?? 0) + 1 }))
                          }
                          className="h-8 w-8 border border-border-default text-text-secondary hover:border-charcoal/40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activities.length > 0 ? (
              <div>
                <h2 className="font-display text-2xl text-text-primary">Activities</h2>
                <div className="mt-4 space-y-2">
                  {activities.map((activity) => (
                    <label
                      key={activity.id}
                      className="flex items-center justify-between gap-3 border border-border-default px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedActivityIds.has(activity.id)}
                          onChange={(e) =>
                            setSelectedActivityIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(activity.id);
                              else next.delete(activity.id);
                              return next;
                            })
                          }
                        />
                        {activity.title}
                      </span>
                      <span className="text-text-secondary">
                        &#8377;{new Intl.NumberFormat("en-IN").format(activity.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <h2 className="font-display text-2xl text-text-primary">Guest details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="guestName" className={labelClass}>Full name</label>
                  <input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="guestPhone" className={labelClass}>Mobile number</label>
                  <input
                    id="guestPhone"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="guestEmail" className={labelClass}>Email (optional)</label>
                  <input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="nationality" className={labelClass}>Nationality</label>
                  <select
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value as typeof nationality)}
                    className={inputClass}
                  >
                    <option value="Indian">Indian</option>
                    <option value="Foreign national">Foreign national</option>
                  </select>
                </div>
                {!isForeign ? (
                  <div>
                    <label htmlFor="guestStateCode" className={labelClass}>
                      Your GST state (for the tax split)
                    </label>
                    <select
                      id="guestStateCode"
                      value={guestStateCode}
                      onChange={(e) => setGuestStateCode(e.target.value)}
                      className={inputClass}
                    >
                      {GST_STATE_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-warm-white transition-opacity hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to compliance
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6 border border-border-default bg-surface p-6">
            <div>
              <h2 className="font-display text-2xl text-text-primary">Guest verification</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Indian homestays are required to keep an ID record for every guest.
              </p>
            </div>

            {isForeign ? (
              <div className="border border-dashed border-gold bg-warm-white/60 p-4">
                <p className="mb-4 text-sm font-medium text-gold-ink">
                  Foreign nationals: FRRO / Form-C registration applies
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="passportNumber" className={labelClass}>Passport number</label>
                    <input
                      id="passportNumber"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="visaNumber" className={labelClass}>Visa number</label>
                    <input
                      id="visaNumber"
                      value={visaNumber}
                      onChange={(e) => setVisaNumber(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <label className="block cursor-pointer border-2 border-dashed border-sand-dark p-6 text-center text-sm text-text-secondary">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setIdProofFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {idProofFile ? (
                <span className="text-forest">&#10003; {idProofFile.name} selected</span>
              ) : (
                "Tap to upload ID proof (Aadhaar, passport, driving licence...)"
              )}
            </label>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-medium uppercase tracking-[0.1em] text-text-secondary hover:text-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!step2Valid}
                onClick={() => setStep(3)}
                className="bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-warm-white transition-opacity hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue to payment
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6 border border-border-default bg-surface p-6">
            <div>
              <h2 className="font-display text-2xl text-text-primary">Pay the host directly</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Scan to pay via UPI, then enter the transaction reference (UTR) so we can confirm it.
              </p>
            </div>

            {canShowQr ? (
              <div className="border border-border-default bg-warm-white/60 p-6 text-center">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- data URI, not a Supabase/Vercel-optimizable asset
                  <img src={qrDataUrl} alt="UPI payment QR code" className="mx-auto h-56 w-56" />
                ) : (
                  <div className="mx-auto flex h-56 w-56 items-center justify-center text-xs text-text-secondary">
                    Generating QR...
                  </div>
                )}
                <p className="mt-4 text-sm">
                  VPA: <strong>{upiId}</strong>
                </p>
                <p className="text-sm text-text-secondary">Amount: &#8377;{gst.total.toFixed(2)}</p>
              </div>
            ) : (
              <div className="border border-dashed border-sand-dark bg-warm-white/60 px-5 py-4 text-sm text-text-secondary">
                A UPI ID hasn&apos;t been set up for this property yet -- message the host on WhatsApp
                to arrange payment instead of scanning a code here.
              </div>
            )}

            <div>
              <label htmlFor="utrNumber" className={labelClass}>
                UPI transaction reference (UTR)
              </label>
              <input
                id="utrNumber"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12-digit number from your banking app"
                className={inputClass}
              />
            </div>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-medium uppercase tracking-[0.1em] text-text-secondary hover:text-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                disabled={utrNumber.length !== 12 || submitting}
                onClick={handleConfirm}
                className="bg-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-charcoal transition-opacity hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Submitting..." : "Confirm via WhatsApp"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="h-fit space-y-4 border border-border-default bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl text-text-primary">Booking summary</h2>
        {roomSelections.length === 0 && activitySelections.length === 0 ? (
          <p className="text-sm text-text-secondary">Nothing selected yet.</p>
        ) : (
          <>
            <div className="space-y-2">
              {roomSelections.map((r) => (
                <div key={r.roomId} className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {r.quantity}x {r.roomName}
                  </span>
                  <span className="text-text-primary">&#8377;{r.priceAtBooking.toFixed(2)}</span>
                </div>
              ))}
              {activitySelections.map((a) => (
                <div key={a.activityId} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{a.activityTitle}</span>
                  <span className="text-text-primary">&#8377;{a.priceAtBooking.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {isGstCompliant ? (
              <div className="space-y-1 border-t border-border-default pt-3 text-sm">
                {gst.igst > 0 ? (
                  <div className="flex justify-between text-text-secondary">
                    <span>IGST</span>
                    <span>&#8377;{gst.igst.toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-text-secondary">
                      <span>CGST</span>
                      <span>&#8377;{gst.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>SGST</span>
                      <span>&#8377;{gst.sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border-default pt-3 text-base font-medium text-text-primary">
              <span>Total</span>
              <span>&#8377;{gst.total.toFixed(2)}</span>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
