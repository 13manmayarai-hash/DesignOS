import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateBookingInput = {
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  guestNationality: string;
  guestStateCode: string | null;
  checkIn: string;
  checkOut: string;
  roomSelections: { roomId: string; roomName: string; quantity: number; priceAtBooking: number }[];
  activitySelections: { activityId: string; activityTitle: string; priceAtBooking: number }[];
  accommodationTotal: number;
  activitiesTotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  utrNumber: string;
  compliance: {
    passportNumber: string | null;
    visaNumber: string | null;
    idProofStoragePath: string | null;
  } | null;
};

export async function createBooking(supabase: SupabaseClient, input: CreateBookingInput) {
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      guest_name: input.guestName,
      guest_phone: input.guestPhone,
      guest_email: input.guestEmail,
      guest_nationality: input.guestNationality,
      guest_state_code: input.guestStateCode,
      check_in: input.checkIn,
      check_out: input.checkOut,
      accommodation_total: input.accommodationTotal,
      activities_total: input.activitiesTotal,
      cgst_amount: input.cgstAmount,
      sgst_amount: input.sgstAmount,
      igst_amount: input.igstAmount,
      total_amount: input.totalAmount,
      utr_number: input.utrNumber,
    })
    .select()
    .single();
  if (bookingError) throw bookingError;

  if (input.roomSelections.length > 0) {
    const { error } = await supabase.from("booking_items").insert(
      input.roomSelections.map((room) => ({
        booking_id: booking.id,
        room_id: room.roomId,
        room_name: room.roomName,
        quantity: room.quantity,
        price_at_booking: room.priceAtBooking,
      }))
    );
    if (error) throw error;
  }

  if (input.activitySelections.length > 0) {
    const { error } = await supabase.from("booking_activities").insert(
      input.activitySelections.map((activity) => ({
        booking_id: booking.id,
        activity_id: activity.activityId,
        activity_title: activity.activityTitle,
        price_at_booking: activity.priceAtBooking,
      }))
    );
    if (error) throw error;
  }

  if (input.compliance) {
    const { error } = await supabase.from("booking_compliance").insert({
      booking_id: booking.id,
      passport_number: input.compliance.passportNumber,
      visa_number: input.compliance.visaNumber,
      id_proof_storage_path: input.compliance.idProofStoragePath,
      submitted_frro: false,
    });
    if (error) throw error;
  }

  // Seeds the status timeline shown on /admin/bookings -- booking.status is
  // whatever the "status" column defaulted to (AWAITING_UPI_RECONCILIATION).
  const { error: eventError } = await supabase
    .from("booking_status_events")
    .insert({ booking_id: booking.id, status: booking.status });
  if (eventError) throw eventError;

  return booking;
}
