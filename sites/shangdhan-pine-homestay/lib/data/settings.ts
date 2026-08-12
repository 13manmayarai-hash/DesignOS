import type { SupabaseClient } from "@supabase/supabase-js";

export type Settings = {
  gst_applicable: boolean;
  gstin: string | null;
  payment_qr_storage_path: string | null;
};

// settings is a singleton row (id is always `true`, see supabase/schema.sql).
export async function getSettings(supabase: SupabaseClient): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("gst_applicable, gstin, payment_qr_storage_path")
    .eq("id", true)
    .single();
  if (error) throw error;
  return data as Settings;
}

export async function updateGstSettings(
  supabase: SupabaseClient,
  input: { gstApplicable: boolean; gstin: string | null }
) {
  const { error } = await supabase
    .from("settings")
    .update({ gst_applicable: input.gstApplicable, gstin: input.gstin })
    .eq("id", true);
  if (error) throw error;
}

export async function setPaymentQrStoragePath(supabase: SupabaseClient, path: string | null) {
  const { error } = await supabase
    .from("settings")
    .update({ payment_qr_storage_path: path })
    .eq("id", true);
  if (error) throw error;
}
