import type { SupabaseClient } from "@supabase/supabase-js";

// Field names match the numbered wireframe in /admin/cinematic 1:1 --
// see supabase/schema.sql for the column-by-column mapping.
export type CinematicHero = {
  header_logo_label: string | null;
  sky_image_path: string | null;
  sky_video_path: string | null;
  glow_image_path: string | null;
  midground_image_path: string | null;
  hero_headline: string | null;
  intro_paragraph: string | null;
  hero_tag_1: string | null;
  hero_tag_2: string | null;
  hero_tag_3: string | null;
  splitframe_left_path: string | null;
  splitframe_right_path: string | null;
  main_image_path: string | null;
  main_video_path: string | null;
  closeup_image_path: string | null;
  panel1_heading: string | null;
  panel1_paragraph: string | null;
  panel1_fact1_value: string | null;
  panel1_fact1_label: string | null;
  panel1_fact2_value: string | null;
  panel1_fact2_label: string | null;
  panel2_heading: string | null;
  panel2_paragraph: string | null;
  panel2_cta_label: string | null;
};

// cinematic_hero is a singleton row (id is always `true`, see schema.sql).
// select("*") rather than an explicit column list -- supabase-js's
// select-string type parser falls back to an unusable error type on a
// list this long, so keep it simple and let the return cast do the work.
export async function getCinematicHero(supabase: SupabaseClient): Promise<CinematicHero> {
  const { data, error } = await supabase
    .from("cinematic_hero")
    .select("*")
    .eq("id", true)
    .single();
  if (error) throw error;
  return data as CinematicHero;
}

export async function updateCinematicHero(
  supabase: SupabaseClient,
  fields: Partial<CinematicHero>
) {
  const { error } = await supabase.from("cinematic_hero").update(fields).eq("id", true);
  if (error) throw error;
}

export type SightCard = {
  id: string;
  kicker: string | null;
  title: string | null;
  description: string | null;
  pin_icon_path: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type SightCardInput = {
  kicker: string | null;
  title: string | null;
  description: string | null;
  published: boolean;
};

export async function getAllSightCards(supabase: SupabaseClient): Promise<SightCard[]> {
  const { data, error } = await supabase
    .from("cinematic_sight_cards")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as SightCard[];
}

export async function createSightCard(supabase: SupabaseClient, input: SightCardInput) {
  const { data: existing } = await supabase
    .from("cinematic_sight_cards")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = existing ? existing.sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("cinematic_sight_cards")
    .insert({ ...input, sort_order: nextSortOrder })
    .select()
    .single();
  if (error) throw error;
  return data as SightCard;
}

export async function updateSightCard(
  supabase: SupabaseClient,
  id: string,
  input: SightCardInput
) {
  const { error } = await supabase.from("cinematic_sight_cards").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteSightCard(supabase: SupabaseClient, id: string) {
  const { data: card } = await supabase
    .from("cinematic_sight_cards")
    .select("pin_icon_path")
    .eq("id", id)
    .maybeSingle();

  if (card?.pin_icon_path) {
    await supabase.storage.from("cinematic-media").remove([card.pin_icon_path]);
  }

  const { error } = await supabase.from("cinematic_sight_cards").delete().eq("id", id);
  if (error) throw error;
}

export async function setSightCardPinIcon(
  supabase: SupabaseClient,
  id: string,
  storagePath: string | null
) {
  const { error } = await supabase
    .from("cinematic_sight_cards")
    .update({ pin_icon_path: storagePath })
    .eq("id", id);
  if (error) throw error;
}

export async function moveSightCard(
  supabase: SupabaseClient,
  id: string,
  direction: "up" | "down"
) {
  const { data: cards, error } = await supabase
    .from("cinematic_sight_cards")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const index = cards.findIndex((c: { id: string }) => c.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= cards.length) return;

  const current = cards[index];
  const swap = cards[swapIndex];

  await Promise.all([
    supabase
      .from("cinematic_sight_cards")
      .update({ sort_order: swap.sort_order })
      .eq("id", current.id),
    supabase
      .from("cinematic_sight_cards")
      .update({ sort_order: current.sort_order })
      .eq("id", swap.id),
  ]);
}
