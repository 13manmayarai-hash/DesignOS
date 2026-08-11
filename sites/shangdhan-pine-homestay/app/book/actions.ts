"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createBooking, type CreateBookingInput } from "@/lib/data/bookings";
import { randomStoragePath } from "@/lib/storage";

export type SubmitBookingResult = { ok: true; bookingId: string } | { ok: false; error: string };

// No auth required -- guests never log in. RLS (see supabase/schema.sql)
// only grants INSERT to the anon role on these tables, never SELECT, so a
// guest can create a booking here but can't read any booking back,
// including their own or anyone else's.
export async function submitBookingAction(formData: FormData): Promise<SubmitBookingResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Booking isn't set up yet -- please use WhatsApp instead." };
  }

  try {
    const supabase = await createClient();
    const roomSelections = JSON.parse(String(formData.get("roomSelections") ?? "[]"));
    const activitySelections = JSON.parse(String(formData.get("activitySelections") ?? "[]"));
    const nationality = String(formData.get("guestNationality") ?? "Indian");
    const isForeign = nationality !== "Indian";

    let idProofStoragePath: string | null = null;
    const idProofFile = formData.get("idProofFile");
    if (idProofFile instanceof File && idProofFile.size > 0) {
      const path = randomStoragePath(idProofFile.name);
      const { error: uploadError } = await supabase.storage
        .from("guest-documents")
        .upload(path, idProofFile, { contentType: idProofFile.type });
      if (uploadError) throw uploadError;
      idProofStoragePath = path;
    }

    const input: CreateBookingInput = {
      guestName: String(formData.get("guestName") ?? ""),
      guestPhone: String(formData.get("guestPhone") ?? ""),
      guestEmail: String(formData.get("guestEmail") ?? "") || null,
      guestNationality: nationality,
      guestStateCode: String(formData.get("guestStateCode") ?? "") || null,
      checkIn: String(formData.get("checkIn") ?? ""),
      checkOut: String(formData.get("checkOut") ?? ""),
      roomSelections,
      activitySelections,
      accommodationTotal: Number(formData.get("accommodationTotal") ?? 0),
      activitiesTotal: Number(formData.get("activitiesTotal") ?? 0),
      cgstAmount: Number(formData.get("cgstAmount") ?? 0),
      sgstAmount: Number(formData.get("sgstAmount") ?? 0),
      igstAmount: Number(formData.get("igstAmount") ?? 0),
      totalAmount: Number(formData.get("totalAmount") ?? 0),
      utrNumber: String(formData.get("utrNumber") ?? ""),
      compliance:
        isForeign || idProofStoragePath
          ? {
              passportNumber: String(formData.get("passportNumber") ?? "") || null,
              visaNumber: String(formData.get("visaNumber") ?? "") || null,
              idProofStoragePath,
            }
          : null,
    };

    if (!input.guestName || !input.guestPhone) {
      return { ok: false, error: "Name and phone are required." };
    }

    const booking = await createBooking(supabase, input);
    return { ok: true, bookingId: booking.id };
  } catch (error) {
    console.error("submitBookingAction failed", error);
    return { ok: false, error: "Something went wrong submitting the booking. Please try again." };
  }
}
