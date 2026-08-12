import type { SupabaseClient } from "@supabase/supabase-js";

export type GalleryImage = {
  id: string;
  storage_path: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
};

export async function getGalleryImages(supabase: SupabaseClient): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addGalleryImage(
  supabase: SupabaseClient,
  storagePath: string,
  caption: string | null,
  category: string | null
) {
  const { data: existing } = await supabase
    .from("gallery_images")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = existing ? existing.sort_order + 1 : 0;

  const { error } = await supabase.from("gallery_images").insert({
    storage_path: storagePath,
    caption,
    category,
    sort_order: nextSortOrder,
  });
  if (error) throw error;
}

export async function updateGalleryImage(
  supabase: SupabaseClient,
  id: string,
  caption: string | null,
  category: string | null
) {
  const { error } = await supabase
    .from("gallery_images")
    .update({ caption, category })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteGalleryImage(supabase: SupabaseClient, id: string) {
  // maybeSingle, not single -- a double-click or already-deleted row should
  // no-op the storage cleanup, not throw and leave the delete half-done.
  const { data: image, error: fetchError } = await supabase
    .from("gallery_images")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (image) {
    await supabase.storage.from("gallery-photos").remove([image.storage_path]);
  }

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) throw error;
}

export async function moveGalleryImage(
  supabase: SupabaseClient,
  id: string,
  direction: "up" | "down"
) {
  const { data: images, error } = await supabase
    .from("gallery_images")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const index = images.findIndex((img) => img.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= images.length) return;

  const current = images[index];
  const swap = images[swapIndex];

  await Promise.all([
    supabase.from("gallery_images").update({ sort_order: swap.sort_order }).eq("id", current.id),
    supabase.from("gallery_images").update({ sort_order: current.sort_order }).eq("id", swap.id),
  ]);
}
