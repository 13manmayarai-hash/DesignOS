import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_FONT_CHOICE_ID, type TextCase } from "@/lib/fonts";

export type Settings = {
  gst_applicable: boolean;
  gstin: string | null;
  payment_qr_storage_path: string | null;
  display_font_choice: string;
  display_font_custom_storage_path: string | null;
  display_text_case: TextCase;
  display_small_caps: boolean;
  display_letter_spacing: number;
};

const EMPTY_SETTINGS: Settings = {
  gst_applicable: false,
  gstin: null,
  payment_qr_storage_path: null,
  display_font_choice: DEFAULT_FONT_CHOICE_ID,
  display_font_custom_storage_path: null,
  display_text_case: "none",
  display_small_caps: false,
  display_letter_spacing: 0,
};

const SETTINGS_COLUMNS =
  "gst_applicable, gstin, payment_qr_storage_path, display_font_choice, display_font_custom_storage_path, display_text_case, display_small_caps, display_letter_spacing";

// settings is a singleton row (id is always `true`, see supabase/schema.sql)
// that the migration seeds automatically -- but this is read by the public
// /book page as well as /admin/settings, so don't let a missing row take
// either down. maybeSingle() + a well-known-shape fallback instead of
// single() + throw (same fix as lib/data/cinematic.ts's getCinematicHero).
export async function getSettings(supabase: SupabaseClient): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select(SETTINGS_COLUMNS)
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

export async function updateTypographySettings(
  supabase: SupabaseClient,
  input: {
    displayFontChoice: string;
    displayTextCase: TextCase;
    displaySmallCaps: boolean;
    displayLetterSpacing: number;
  }
) {
  const { error } = await supabase
    .from("settings")
    .update({
      display_font_choice: input.displayFontChoice,
      display_text_case: input.displayTextCase,
      display_small_caps: input.displaySmallCaps,
      display_letter_spacing: input.displayLetterSpacing,
    })
    .eq("id", true);
  if (error) throw error;
}

export async function setCustomFontStoragePath(supabase: SupabaseClient, path: string | null) {
  const { error } = await supabase
    .from("settings")
    .update({ display_font_custom_storage_path: path })
    .eq("id", true);
  if (error) throw error;
}
