import type { SupabaseClient } from "@supabase/supabase-js";
import type { TextCase } from "@/lib/fonts";

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
  headline_theme_color: string | null;
};

const EMPTY_CINEMATIC_HERO: CinematicHero = {
  header_logo_label: null,
  sky_image_path: null,
  sky_video_path: null,
  glow_image_path: null,
  midground_image_path: null,
  hero_headline: null,
  intro_paragraph: null,
  hero_tag_1: null,
  hero_tag_2: null,
  hero_tag_3: null,
  splitframe_left_path: null,
  splitframe_right_path: null,
  main_image_path: null,
  main_video_path: null,
  closeup_image_path: null,
  panel1_heading: null,
  panel1_paragraph: null,
  panel1_fact1_value: null,
  panel1_fact1_label: null,
  panel1_fact2_value: null,
  panel1_fact2_label: null,
  panel2_heading: null,
  panel2_paragraph: null,
  panel2_cta_label: null,
  headline_theme_color: null,
};

// cinematic_hero is a singleton row (id is always `true`, see schema.sql)
// that the migration seeds automatically -- but this being a public-facing
// homepage read, don't let a missing row (a schema.sql run that predates
// this table, a row deleted by hand, anything) take down the whole site.
// maybeSingle() + a well-known-shape fallback instead of single() + throw.
// select("*") rather than an explicit column list -- supabase-js's
// select-string type parser falls back to an unusable error type on a
// list this long, so keep it simple and let the return cast do the work.
export async function getCinematicHero(supabase: SupabaseClient): Promise<CinematicHero> {
  const { data, error } = await supabase
    .from("cinematic_hero")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  if (error) throw error;
  return (data as CinematicHero | null) ?? EMPTY_CINEMATIC_HERO;
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

export async function getPublishedSightCards(supabase: SupabaseClient): Promise<SightCard[]> {
  const { data, error } = await supabase
    .from("cinematic_sight_cards")
    .select("*")
    .eq("published", true)
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

export type HeadlineLayer = "behind" | "normal" | "front";

export const HEADLINE_LAYER_OPTIONS: { value: HeadlineLayer; label: string }[] = [
  { value: "behind", label: "Behind the scene (mountain/imagery can cover it)" },
  { value: "normal", label: "Normal (same as before)" },
  { value: "front", label: "In front of everything" },
];

export type HeadlineSegment = {
  id: string;
  sort_order: number;
  text: string;
  font_choice: string | null;
  text_case: TextCase;
  color: string | null;
  size_multiplier: number;
  offset_x: number;
  offset_y: number;
  layer: HeadlineLayer;
  created_at: string;
};

// One row per word, as the editor's local state has it -- id is null for a
// word the admin just added client-side (typed an extra word into the
// headline) and hasn't been saved yet.
export type HeadlineSegmentSave = {
  id: string | null;
  text: string;
  fontChoice: string | null;
  textCase: TextCase;
  color: string | null;
  sizeMultiplier: number;
  offsetX: number;
  offsetY: number;
  layer: HeadlineLayer;
};

export async function getHeadlineSegments(supabase: SupabaseClient): Promise<HeadlineSegment[]> {
  const { data, error } = await supabase
    .from("cinematic_headline_segments")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as HeadlineSegment[];
}

// Syncs the whole word list in one call, since the editor edits the
// headline as a single unit (type a word, its settings card appears; the
// count was never a separate field to manage) rather than one row at a
// time: deletes rows dropped from the list, updates the ones that remain
// (including a fresh sort_order matching their new position), inserts the
// ones typed in client-side since the last save. Returns the saved rows,
// in the same order as the input, so the editor can pick up the real
// database id assigned to a just-inserted word -- otherwise its next save
// would still see id: null and insert a duplicate instead of updating.
export async function replaceHeadlineSegments(
  supabase: SupabaseClient,
  segments: HeadlineSegmentSave[]
): Promise<HeadlineSegment[]> {
  const { data: existing, error: fetchError } = await supabase
    .from("cinematic_headline_segments")
    .select("id");
  if (fetchError) throw fetchError;

  const keepIds = new Set(segments.map((s) => s.id).filter((id): id is string => Boolean(id)));
  const toDelete = ((existing ?? []) as { id: string }[])
    .map((r) => r.id)
    .filter((id) => !keepIds.has(id));

  if (toDelete.length > 0) {
    const { error } = await supabase.from("cinematic_headline_segments").delete().in("id", toDelete);
    if (error) throw error;
  }

  const saved: HeadlineSegment[] = [];
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const row = {
      text: s.text,
      font_choice: s.fontChoice,
      text_case: s.textCase,
      color: s.color,
      size_multiplier: s.sizeMultiplier,
      offset_x: s.offsetX,
      offset_y: s.offsetY,
      layer: s.layer,
      sort_order: i,
    };
    if (s.id) {
      const { data, error } = await supabase
        .from("cinematic_headline_segments")
        .update(row)
        .eq("id", s.id)
        .select()
        .single();
      if (error) throw error;
      saved.push(data as HeadlineSegment);
    } else {
      const { data, error } = await supabase
        .from("cinematic_headline_segments")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      saved.push(data as HeadlineSegment);
    }
  }
  return saved;
}
