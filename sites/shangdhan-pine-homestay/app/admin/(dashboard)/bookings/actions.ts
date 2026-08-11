"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import { updateBookingStatus, markFrroSubmitted, type BookingStatus } from "@/lib/data/admin-bookings";

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  await requireUser();
  const supabase = await createClient();
  await updateBookingStatus(supabase, bookingId, status);
  revalidatePath("/admin/bookings");
}

export async function markFrroSubmittedAction(bookingId: string, submitted: boolean) {
  await requireUser();
  const supabase = await createClient();
  await markFrroSubmitted(supabase, bookingId, submitted);
  revalidatePath("/admin/bookings");
}
