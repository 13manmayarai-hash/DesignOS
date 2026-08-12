import type { SupabaseClient } from "@supabase/supabase-js";

export type Invoice = {
  id: string;
  booking_id: string;
  invoice_number: string;
  pdf_storage_path: string;
  created_at: string;
};

export async function getAllInvoices(supabase: SupabaseClient): Promise<Invoice[]> {
  const { data, error } = await supabase.from("invoices").select("*");
  if (error) throw error;
  return data as Invoice[];
}

export async function getInvoiceForBooking(
  supabase: SupabaseClient,
  bookingId: string
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (error) throw error;
  return data as Invoice | null;
}

export async function getNextInvoiceNumber(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.rpc("next_invoice_number");
  if (error) throw error;
  return data as string;
}

export async function upsertInvoice(
  supabase: SupabaseClient,
  input: { bookingId: string; invoiceNumber: string; pdfStoragePath: string }
) {
  const { error } = await supabase
    .from("invoices")
    .upsert(
      {
        booking_id: input.bookingId,
        invoice_number: input.invoiceNumber,
        pdf_storage_path: input.pdfStoragePath,
      },
      { onConflict: "booking_id" }
    );
  if (error) throw error;
}
