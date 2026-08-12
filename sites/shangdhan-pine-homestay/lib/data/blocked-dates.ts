import type { SupabaseClient } from "@supabase/supabase-js";

export type BlockedRange = {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
};

export async function getBlockedRangesForRoom(
  supabase: SupabaseClient,
  roomId: string
): Promise<BlockedRange[]> {
  const { data, error } = await supabase
    .from("room_blocked_ranges")
    .select("*")
    .eq("room_id", roomId)
    .order("start_date", { ascending: true });
  if (error) throw error;
  return data as BlockedRange[];
}

export async function getAllBlockedRanges(
  supabase: SupabaseClient
): Promise<BlockedRange[]> {
  const { data, error } = await supabase
    .from("room_blocked_ranges")
    .select("*")
    .order("start_date", { ascending: true });
  if (error) throw error;
  return data as BlockedRange[];
}

export async function createBlockedRange(
  supabase: SupabaseClient,
  input: { roomId: string; startDate: string; endDate: string; reason: string | null }
) {
  const { error } = await supabase.from("room_blocked_ranges").insert({
    room_id: input.roomId,
    start_date: input.startDate,
    end_date: input.endDate,
    reason: input.reason,
  });
  if (error) throw error;
}

export async function deleteBlockedRange(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("room_blocked_ranges").delete().eq("id", id);
  if (error) throw error;
}
