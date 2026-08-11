import type { SupabaseClient } from "@supabase/supabase-js";

export type Activity = {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export async function getPublishedActivities(supabase: SupabaseClient): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}
