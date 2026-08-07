"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import {
  addGalleryImage,
  deleteGalleryImage,
  moveGalleryImage,
  updateGalleryImage,
} from "@/lib/data/gallery";
import { randomStoragePath } from "@/lib/storage";

export async function uploadGalleryImageAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a photo to upload");
  }

  const path = randomStoragePath(file.name);
  const { error: uploadError } = await supabase.storage
    .from("gallery-photos")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  const caption = String(formData.get("caption") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  await addGalleryImage(supabase, path, caption, category);

  revalidatePath("/admin/gallery");
  revalidatePath("/");
}

export async function updateGalleryImageAction(id: string, formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const caption = String(formData.get("caption") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  await updateGalleryImage(supabase, id, caption, category);

  revalidatePath("/admin/gallery");
  revalidatePath("/");
}

export async function deleteGalleryImageAction(id: string) {
  await requireUser();
  const supabase = await createClient();
  await deleteGalleryImage(supabase, id);
  revalidatePath("/admin/gallery");
  revalidatePath("/");
}

export async function moveGalleryImageAction(id: string, direction: "up" | "down") {
  await requireUser();
  const supabase = await createClient();
  await moveGalleryImage(supabase, id, direction);
  revalidatePath("/admin/gallery");
  revalidatePath("/");
}
