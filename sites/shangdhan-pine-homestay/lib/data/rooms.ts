import type { SupabaseClient } from "@supabase/supabase-js";

export type RoomImage = {
  id: string;
  room_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type Room = {
  id: string;
  name: string;
  rent_amount: number | null;
  rent_unit: string;
  size_sqft: number | null;
  max_guests: number | null;
  description: string | null;
  amenities: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  room_images: RoomImage[];
};

export type RoomInput = {
  name: string;
  rent_amount: number | null;
  rent_unit: string;
  size_sqft: number | null;
  max_guests: number | null;
  description: string | null;
  amenities: string[];
  published: boolean;
};

const ROOM_SELECT = "*, room_images(*)";

function sortRoom(room: Room): Room {
  return {
    ...room,
    room_images: [...room.room_images].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getPublishedRooms(supabase: SupabaseClient): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select(ROOM_SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as unknown as Room[]).map(sortRoom);
}

export async function getAllRooms(supabase: SupabaseClient): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select(ROOM_SELECT)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as unknown as Room[]).map(sortRoom);
}

export async function getRoom(supabase: SupabaseClient, id: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select(ROOM_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? sortRoom(data as unknown as Room) : null;
}

export async function createRoom(supabase: SupabaseClient, input: RoomInput) {
  const { data: existing } = await supabase
    .from("rooms")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = existing ? existing.sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("rooms")
    .insert({ ...input, sort_order: nextSortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRoom(supabase: SupabaseClient, id: string, input: RoomInput) {
  const { error } = await supabase.from("rooms").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteRoom(supabase: SupabaseClient, id: string) {
  const { data: images } = await supabase
    .from("room_images")
    .select("storage_path")
    .eq("room_id", id);

  if (images && images.length > 0) {
    await supabase.storage
      .from("room-photos")
      .remove(images.map((img) => img.storage_path));
  }

  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) throw error;
}

export async function addRoomImage(
  supabase: SupabaseClient,
  roomId: string,
  storagePath: string,
  altText: string | null
) {
  const { data: existing } = await supabase
    .from("room_images")
    .select("sort_order")
    .eq("room_id", roomId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = existing ? existing.sort_order + 1 : 0;

  const { error } = await supabase.from("room_images").insert({
    room_id: roomId,
    storage_path: storagePath,
    alt_text: altText,
    sort_order: nextSortOrder,
  });
  if (error) throw error;
}

export async function deleteRoomImage(supabase: SupabaseClient, imageId: string) {
  // maybeSingle, not single -- a double-click or already-deleted row should
  // no-op the storage cleanup, not throw and leave the delete half-done.
  const { data: image, error: fetchError } = await supabase
    .from("room_images")
    .select("storage_path")
    .eq("id", imageId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (image) {
    await supabase.storage.from("room-photos").remove([image.storage_path]);
  }

  const { error } = await supabase.from("room_images").delete().eq("id", imageId);
  if (error) throw error;
}

export async function moveRoomImage(
  supabase: SupabaseClient,
  roomId: string,
  imageId: string,
  direction: "up" | "down"
) {
  const { data: images, error } = await supabase
    .from("room_images")
    .select("id, sort_order")
    .eq("room_id", roomId)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const index = images.findIndex((img) => img.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= images.length) return;

  const current = images[index];
  const swap = images[swapIndex];

  await Promise.all([
    supabase.from("room_images").update({ sort_order: swap.sort_order }).eq("id", current.id),
    supabase.from("room_images").update({ sort_order: current.sort_order }).eq("id", swap.id),
  ]);
}
