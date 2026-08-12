import type { SupabaseClient } from "@supabase/supabase-js";

// Calls the is_room_available() SQL function (see supabase/schema.sql),
// which runs as SECURITY DEFINER so this works for the anon role too --
// guests never get SELECT on the bookings table itself, only this narrow
// yes/no computed over it.
export async function isRoomAvailable(
  supabase: SupabaseClient,
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_room_available", {
    p_room_id: roomId,
    p_check_in: checkIn,
    p_check_out: checkOut,
  });
  if (error) throw error;
  return Boolean(data);
}
