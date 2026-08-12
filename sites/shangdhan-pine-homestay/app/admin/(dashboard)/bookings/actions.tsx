"use server";

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient, requireUser } from "@/lib/supabase/server";
import {
  updateBookingStatus,
  markFrroSubmitted,
  getBookingById,
  type BookingStatus,
} from "@/lib/data/admin-bookings";
import { getSettings } from "@/lib/data/settings";
import { getInvoiceForBooking, getNextInvoiceNumber, upsertInvoice } from "@/lib/data/invoices";
import { randomStoragePath } from "@/lib/storage";
import { InvoicePdf } from "@/lib/invoice-pdf";

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  await requireUser();
  const supabase = await createClient();
  await updateBookingStatus(supabase, bookingId, status);
  revalidatePath("/admin/bookings");
}

export async function markFrroSubmittedAction(bookingId: string, submitted: boolean) {
  await requireUser();
  const supabase = await createClient();
  await markFrroSubmitted(supabase, bookingId, submitted);
  revalidatePath("/admin/bookings");
}

// A booking only has real amounts to invoice once payment is confirmed --
// AWAITING_UPI_RECONCILIATION hasn't been verified yet and CANCELLED never
// completed, so both are blocked here rather than just hidden in the UI.
export async function generateInvoiceAction(bookingId: string) {
  await requireUser();
  const supabase = await createClient();

  const booking = await getBookingById(supabase, bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "AWAITING_UPI_RECONCILIATION" || booking.status === "CANCELLED") {
    throw new Error("Only confirmed bookings can be invoiced");
  }

  const settings = await getSettings(supabase);
  const existing = await getInvoiceForBooking(supabase, bookingId);
  const invoiceNumber = existing?.invoice_number ?? (await getNextInvoiceNumber(supabase));

  const buffer = await renderToBuffer(
    <InvoicePdf booking={booking} settings={settings} invoiceNumber={invoiceNumber} />
  );

  if (existing) {
    await supabase.storage.from("invoices").remove([existing.pdf_storage_path]);
  }
  const path = randomStoragePath("invoice.pdf");
  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(path, buffer, { contentType: "application/pdf" });
  if (uploadError) throw uploadError;

  await upsertInvoice(supabase, { bookingId, invoiceNumber, pdfStoragePath: path });
  revalidatePath("/admin/bookings");
}
