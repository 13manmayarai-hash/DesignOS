"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import {
  getSettings,
  updateGstSettings,
  setPaymentQrStoragePath,
  updateTypographySettings,
  setCustomFontStoragePath,
} from "@/lib/data/settings";
import { randomStoragePath } from "@/lib/storage";
import { TEXT_CASE_OPTIONS, type TextCase } from "@/lib/fonts";

export async function updateGstSettingsAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const gstApplicable = formData.get("gstApplicable") === "yes";
  const gstin = String(formData.get("gstin") ?? "").trim() || null;
  await updateGstSettings(supabase, { gstApplicable, gstin: gstApplicable ? gstin : null });

  revalidatePath("/admin/settings");
  revalidatePath("/book");
}

export async function uploadPaymentQrAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const file = formData.get("qrImage");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a QR code image to upload");
  }

  const previous = await getSettings(supabase);

  const path = randomStoragePath(file.name);
  const { error: uploadError } = await supabase.storage
    .from("payment-qr")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  await setPaymentQrStoragePath(supabase, path);

  if (previous.payment_qr_storage_path) {
    await supabase.storage.from("payment-qr").remove([previous.payment_qr_storage_path]);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/book");
}

export async function removePaymentQrAction() {
  await requireUser();
  const supabase = await createClient();

  const current = await getSettings(supabase);
  if (current.payment_qr_storage_path) {
    await supabase.storage.from("payment-qr").remove([current.payment_qr_storage_path]);
  }
  await setPaymentQrStoragePath(supabase, null);

  revalidatePath("/admin/settings");
  revalidatePath("/book");
}

const VALID_TEXT_CASES = new Set(TEXT_CASE_OPTIONS.map((o) => o.value));

export async function updateTypographySettingsAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const displayFontChoice = String(formData.get("displayFontChoice") ?? "roboto");
  const textCaseRaw = String(formData.get("displayTextCase") ?? "none");
  const displayTextCase: TextCase = VALID_TEXT_CASES.has(textCaseRaw as TextCase)
    ? (textCaseRaw as TextCase)
    : "none";
  const displaySmallCaps = formData.get("displaySmallCaps") === "on";
  const letterSpacingRaw = Number(formData.get("displayLetterSpacing"));
  const displayLetterSpacing = Number.isFinite(letterSpacingRaw) ? letterSpacingRaw : 0;

  await updateTypographySettings(supabase, {
    displayFontChoice,
    displayTextCase,
    displaySmallCaps,
    displayLetterSpacing,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/book");
}

export async function uploadCustomFontAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const file = formData.get("fontFile");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a font file to upload");
  }

  const previous = await getSettings(supabase);

  const path = randomStoragePath(file.name);
  const { error: uploadError } = await supabase.storage
    .from("custom-fonts")
    .upload(path, file, { contentType: file.type || "font/woff2" });
  if (uploadError) throw uploadError;

  await setCustomFontStoragePath(supabase, path);
  await updateTypographySettings(supabase, {
    displayFontChoice: "custom",
    displayTextCase: previous.display_text_case,
    displaySmallCaps: previous.display_small_caps,
    displayLetterSpacing: previous.display_letter_spacing,
  });

  if (previous.display_font_custom_storage_path) {
    await supabase.storage.from("custom-fonts").remove([previous.display_font_custom_storage_path]);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/book");
}

export async function removeCustomFontAction() {
  await requireUser();
  const supabase = await createClient();

  const current = await getSettings(supabase);
  if (current.display_font_custom_storage_path) {
    await supabase.storage.from("custom-fonts").remove([current.display_font_custom_storage_path]);
  }
  await setCustomFontStoragePath(supabase, null);
  if (current.display_font_choice === "custom") {
    await updateTypographySettings(supabase, {
      displayFontChoice: "roboto",
      displayTextCase: current.display_text_case,
      displaySmallCaps: current.display_small_caps,
      displayLetterSpacing: current.display_letter_spacing,
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/book");
}
