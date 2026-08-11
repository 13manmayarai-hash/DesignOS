import { Resend } from "resend";
import { property, bookingEmailFrom } from "@/lib/property-config";

// RESEND_API_KEY is server-only (no NEXT_PUBLIC_ prefix) -- this module must
// never be imported from a Client Component. It only ever runs from the
// /book server action.
export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export type BookingConfirmationEmailInput = {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomSelections: { roomName: string; quantity: number; priceAtBooking: number }[];
  activitySelections: { activityTitle: string; priceAtBooking: number }[];
  totalAmount: number;
};

function formatInr(amount: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function buildHtml(input: BookingConfirmationEmailInput) {
  const reference = input.bookingId.slice(0, 8).toUpperCase();
  const roomRows = input.roomSelections
    .map(
      (r) =>
        `<tr><td style="padding:6px 0;color:#262220;">${r.quantity}x ${r.roomName}</td><td style="padding:6px 0;text-align:right;color:#262220;">${formatInr(r.priceAtBooking)}</td></tr>`
    )
    .join("");
  const activityRows = input.activitySelections
    .map(
      (a) =>
        `<tr><td style="padding:6px 0;color:#262220;">${a.activityTitle}</td><td style="padding:6px 0;text-align:right;color:#262220;">${formatInr(a.priceAtBooking)}</td></tr>`
    )
    .join("");

  return `
  <div style="font-family:Georgia,'Times New Roman',serif;background:#fbf7f1;padding:32px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e8dcc8;">
      <div style="padding:28px 28px 20px;border-bottom:1px solid #e8dcc8;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8a6423;font-family:Arial,sans-serif;">Booking request received</p>
        <h1 style="margin:0;font-size:24px;color:#262220;">${property.name}</h1>
      </div>
      <div style="padding:24px 28px;font-family:Arial,sans-serif;font-size:14px;color:#262220;line-height:1.6;">
        <p>Hi ${input.guestName},</p>
        <p>
          We've received your booking request, reference
          <strong>#${reference}</strong>. The host will confirm your dates once
          they've verified your UPI payment.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:18px 0;">
          <tr><td style="padding:4px 0;color:#6b6259;">Check-in</td><td style="padding:4px 0;text-align:right;">${formatDate(input.checkIn)}</td></tr>
          <tr><td style="padding:4px 0;color:#6b6259;">Check-out</td><td style="padding:4px 0;text-align:right;">${formatDate(input.checkOut)}</td></tr>
          <tr><td style="padding:4px 0;color:#6b6259;">Nights</td><td style="padding:4px 0;text-align:right;">${input.nights}</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8dcc8;padding-top:8px;">
          ${roomRows}
          ${activityRows}
        </table>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8dcc8;margin-top:8px;">
          <tr><td style="padding:10px 0 0;font-weight:bold;">Total</td><td style="padding:10px 0 0;text-align:right;font-weight:bold;">${formatInr(input.totalAmount)}</td></tr>
        </table>
        <p style="margin-top:22px;color:#6b6259;font-size:13px;">
          This is an automated confirmation that your request was received --
          it is not yet a confirmed reservation. If you have any questions,
          reply to the host directly on WhatsApp.
        </p>
      </div>
    </div>
  </div>`;
}

export async function sendBookingConfirmationEmail(input: BookingConfirmationEmailInput) {
  if (!isResendConfigured()) return { sent: false as const, reason: "not_configured" as const };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const reference = input.bookingId.slice(0, 8).toUpperCase();

  const { error } = await resend.emails.send({
    from: bookingEmailFrom,
    to: input.guestEmail,
    subject: `Booking request received -- ${property.name} (#${reference})`,
    html: buildHtml(input),
  });

  if (error) {
    console.error("sendBookingConfirmationEmail failed", error);
    return { sent: false as const, reason: "send_failed" as const };
  }
  return { sent: true as const };
}
