import type { SupabaseClient } from "@supabase/supabase-js";

export const BOOKING_STATUSES = [
  "AWAITING_UPI_RECONCILIATION",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type AdminBookingItem = {
  id: string;
  room_name: string;
  quantity: number;
  price_at_booking: number;
};

export type AdminBookingActivity = {
  id: string;
  activity_title: string;
  price_at_booking: number;
};

export type AdminBookingCompliance = {
  passport_number: string | null;
  visa_number: string | null;
  id_proof_storage_path: string | null;
  submitted_frro: boolean;
};

export type BookingStatusEvent = {
  id: string;
  status: BookingStatus;
  created_at: string;
};

export type AdminBooking = {
  id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  guest_nationality: string;
  guest_state_code: string | null;
  check_in: string;
  check_out: string;
  accommodation_total: number;
  activities_total: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
  status: BookingStatus;
  utr_number: string | null;
  created_at: string;
  booking_items: AdminBookingItem[];
  booking_activities: AdminBookingActivity[];
  booking_compliance: AdminBookingCompliance | null;
  booking_status_events: BookingStatusEvent[];
};

// booking_compliance is one-to-one (booking_id is unique), but depending on
// how PostgREST infers the relationship it can come back as an object or a
// single-item array -- normalize defensively either way.
function normalizeCompliance(raw: unknown): AdminBookingCompliance | null {
  if (Array.isArray(raw)) return raw[0] ?? null;
  return (raw as AdminBookingCompliance | null) ?? null;
}

export async function getAllBookings(supabase: SupabaseClient): Promise<AdminBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "*, booking_items(*), booking_activities(*), booking_compliance(*), booking_status_events(*)"
    )
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "booking_status_events", ascending: true });
  if (error) throw error;
  return (data as unknown as AdminBooking[]).map((b) => ({
    ...b,
    booking_compliance: normalizeCompliance(b.booking_compliance),
  }));
}

// Updates the current status and appends to the timeline in one call --
// callers never update one without the other.
export async function updateBookingStatus(
  supabase: SupabaseClient,
  bookingId: string,
  status: BookingStatus
) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
  if (error) throw error;

  const { error: eventError } = await supabase
    .from("booking_status_events")
    .insert({ booking_id: bookingId, status });
  if (eventError) throw eventError;
}

export async function markFrroSubmitted(
  supabase: SupabaseClient,
  bookingId: string,
  submitted: boolean
) {
  const { error } = await supabase
    .from("booking_compliance")
    .update({ submitted_frro: submitted })
    .eq("booking_id", bookingId);
  if (error) throw error;
}
