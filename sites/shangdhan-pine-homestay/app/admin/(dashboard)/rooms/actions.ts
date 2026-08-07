"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import {
  addRoomImage,
  createRoom,
  deleteRoom,
  deleteRoomImage,
  moveRoomImage,
  updateRoom,
  type RoomInput,
} from "@/lib/data/rooms";
import { randomStoragePath } from "@/lib/storage";

function parseRoomInput(formData: FormData): RoomInput {
  const rentAmountRaw = formData.get("rent_amount");
  const sizeRaw = formData.get("size_sqft");
  const guestsRaw = formData.get("max_guests");
  const amenitiesRaw = String(formData.get("amenities") ?? "");

  return {
    name: String(formData.get("name") ?? "").trim(),
    rent_amount: rentAmountRaw ? Number(rentAmountRaw) : null,
    rent_unit: String(formData.get("rent_unit") ?? "per night").trim() || "per night",
    size_sqft: sizeRaw ? Number(sizeRaw) : null,
    max_guests: guestsRaw ? Number(guestsRaw) : null,
    description: String(formData.get("description") ?? "").trim() || null,
    amenities: amenitiesRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    published: formData.get("published") === "on",
  };
}

export async function createRoomAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const input = parseRoomInput(formData);
  if (!input.name) throw new Error("Room name is required");

  await createRoom(supabase, input);
  revalidatePath("/admin/rooms");
  revalidatePath("/");
}

export async function updateRoomAction(roomId: string, formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const input = parseRoomInput(formData);
  if (!input.name) throw new Error("Room name is required");

  await updateRoom(supabase, roomId, input);
  revalidatePath("/admin/rooms");
  revalidatePath("/");
}

export async function deleteRoomAction(roomId: string) {
  await requireUser();
  const supabase = await createClient();
  await deleteRoom(supabase, roomId);
  revalidatePath("/admin/rooms");
  revalidatePath("/");
}

export async function uploadRoomImageAction(roomId: string, formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a photo to upload");
  }

  const path = randomStoragePath(file.name);
  const { error: uploadError } = await supabase.storage
    .from("room-photos")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  const altText = String(formData.get("alt_text") ?? "").trim() || null;
  await addRoomImage(supabase, roomId, path, altText);

  revalidatePath("/admin/rooms");
  revalidatePath("/");
}

export async function deleteRoomImageAction(imageId: string) {
  await requireUser();
  const supabase = await createClient();
  await deleteRoomImage(supabase, imageId);
  revalidatePath("/admin/rooms");
  revalidatePath("/");
}

export async function moveRoomImageAction(
  roomId: string,
  imageId: string,
  direction: "up" | "down"
) {
  await requireUser();
  const supabase = await createClient();
  await moveRoomImage(supabase, roomId, imageId, direction);
  revalidatePath("/admin/rooms");
  revalidatePath("/");
}
