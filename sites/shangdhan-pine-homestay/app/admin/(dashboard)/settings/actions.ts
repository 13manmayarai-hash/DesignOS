"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getSettings, updateGstSettings, setPaymentQrStoragePath } from "@/lib/data/settings";
import { randomStoragePath } from "@/lib/storage";

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
