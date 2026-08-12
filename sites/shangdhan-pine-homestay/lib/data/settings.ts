import type { SupabaseClient } from "@supabase/supabase-js";

export type Settings = {
  gst_applicable: boolean;
  gstin: string | null;
  payment_qr_storage_path: string | null;
};

const EMPTY_SETTINGS: Settings = {
  gst_applicable: false,
  gstin: null,
  payment_qr_storage_path: null,
};

// settings is a singleton row (id is always `true`, see supabase/schema.sql)
// that the migration seeds automatically -- but this is read by the public
// /book page as well as /admin/settings, so don't let a missing row take
// either down. maybeSingle() + a well-known-shape fallback instead of
// single() + throw (same fix as lib/data/cinematic.ts's getCinematicHero).
export async function getSettings(supabase: SupabaseClient): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("gst_applicable, gstin, payment_qr_storage_path")
    .eq("id", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Settings | null) ?? EMPTY_SETTINGS;
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
