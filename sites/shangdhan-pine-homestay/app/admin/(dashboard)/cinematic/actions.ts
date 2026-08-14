"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import {
  getCinematicHero,
  updateCinematicHero,
  createSightCard,
  updateSightCard,
  deleteSightCard,
  moveSightCard,
  setSightCardPinIcon,
  replaceHeadlineSegments,
  type CinematicHero,
  type HeadlineLayer,
  type HeadlineSegmentSave,
} from "@/lib/data/cinematic";
import { TEXT_CASE_OPTIONS, type TextCase } from "@/lib/fonts";

function revalidateCinematic() {
  revalidatePath("/admin/cinematic");
  revalidatePath("/");
}

// { error: null } on success -- returned rather than thrown, and read via
// useActionState in the client form, so a failed upload (bad storage
// bucket/RLS, oversized file, network blip) shows an inline message and
// leaves the rest of the page usable instead of crashing the whole route
// the way an uncaught Server Action error does.
export type MediaActionState = { error: string | null };

function actionErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

// Shared by every single-file scene layer (elements 1, 2, 3, 6, 7, 8, 9 in
// the wireframe). The file itself is NOT sent here -- Vercel Functions cap
// a request body at 4.5MB, well under a typical photo, so the client
// component uploads the file straight to Supabase Storage from the
// browser (see _components/uploadCinematicMedia.ts) and only passes the
// resulting storage path here to point the column at it and clean up
// whatever was there before. Bound to a specific column below.
async function attachCinematicMediaField(
  column: keyof CinematicHero,
  path: string
): Promise<MediaActionState> {
  try {
    await requireUser();
    const supabase = await createClient();

    const current = await getCinematicHero(supabase);
    await updateCinematicHero(supabase, { [column]: path });

    const previousPath = current[column];
    if (previousPath) {
      await supabase.storage.from("cinematic-media").remove([previousPath]);
    }

    revalidateCinematic();
    return { error: null };
  } catch (err) {
    return { error: actionErrorMessage(err) };
  }
}

async function removeCinematicMediaField(
  column: keyof CinematicHero,
  _prevState: MediaActionState,
  _formData: FormData
): Promise<MediaActionState> {
  try {
    await requireUser();
    const supabase = await createClient();

    const current = await getCinematicHero(supabase);
    const path = current[column];
    if (path) {
      await supabase.storage.from("cinematic-media").remove([path]);
    }
    await updateCinematicHero(supabase, { [column]: null });

    revalidateCinematic();
    return { error: null };
  } catch (err) {
    return { error: actionErrorMessage(err) };
  }
}

export const attachSkyImageAction = attachCinematicMediaField.bind(null, "sky_image_path");
export const removeSkyImageAction = removeCinematicMediaField.bind(null, "sky_image_path");
export const attachSkyVideoAction = attachCinematicMediaField.bind(null, "sky_video_path");
export const removeSkyVideoAction = removeCinematicMediaField.bind(null, "sky_video_path");

export const attachGlowImageAction = attachCinematicMediaField.bind(null, "glow_image_path");
export const removeGlowImageAction = removeCinematicMediaField.bind(null, "glow_image_path");
export const attachMidgroundImageAction = attachCinematicMediaField.bind(
  null,
  "midground_image_path"
);
export const removeMidgroundImageAction = removeCinematicMediaField.bind(
  null,
  "midground_image_path"
);

export const attachSplitframeLeftAction = attachCinematicMediaField.bind(
  null,
  "splitframe_left_path"
);
export const removeSplitframeLeftAction = removeCinematicMediaField.bind(
  null,
  "splitframe_left_path"
);
export const attachSplitframeRightAction = attachCinematicMediaField.bind(
  null,
  "splitframe_right_path"
);
export const removeSplitframeRightAction = removeCinematicMediaField.bind(
  null,
  "splitframe_right_path"
);

export const attachMainImageAction = attachCinematicMediaField.bind(null, "main_image_path");
export const removeMainImageAction = removeCinematicMediaField.bind(null, "main_image_path");
export const attachMainVideoAction = attachCinematicMediaField.bind(null, "main_video_path");
export const removeMainVideoAction = removeCinematicMediaField.bind(null, "main_video_path");

export const attachCloseupImageAction = attachCinematicMediaField.bind(
  null,
  "closeup_image_path"
);
export const removeCloseupImageAction = removeCinematicMediaField.bind(
  null,
  "closeup_image_path"
);

// Element 13 (header label) is bundled into this same form since it's a
// single short text field with nothing else to group it with.
export async function updateHeaderAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  await updateCinematicHero(supabase, {
    header_logo_label: String(formData.get("headerLogoLabel") ?? "").trim() || null,
  });
  revalidateCinematic();
}

// Elements 4 + 5: headline, intro paragraph, and the three highlight tags.
export async function updateHeroCopyAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  await updateCinematicHero(supabase, {
    hero_headline: String(formData.get("heroHeadline") ?? "").trim() || null,
    intro_paragraph: String(formData.get("introParagraph") ?? "").trim() || null,
    hero_tag_1: String(formData.get("heroTag1") ?? "").trim() || null,
    hero_tag_2: String(formData.get("heroTag2") ?? "").trim() || null,
    hero_tag_3: String(formData.get("heroTag3") ?? "").trim() || null,
  });
  revalidateCinematic();
}

// Element 11: story panel 1 heading/paragraph + its two stat facts.
export async function updatePanel1Action(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  await updateCinematicHero(supabase, {
    panel1_heading: String(formData.get("panel1Heading") ?? "").trim() || null,
    panel1_paragraph: String(formData.get("panel1Paragraph") ?? "").trim() || null,
    panel1_fact1_value: String(formData.get("panel1Fact1Value") ?? "").trim() || null,
    panel1_fact1_label: String(formData.get("panel1Fact1Label") ?? "").trim() || null,
    panel1_fact2_value: String(formData.get("panel1Fact2Value") ?? "").trim() || null,
    panel1_fact2_label: String(formData.get("panel1Fact2Label") ?? "").trim() || null,
  });
  revalidateCinematic();
}

// Element 12: story panel 2 heading/paragraph + its CTA button label.
export async function updatePanel2Action(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  await updateCinematicHero(supabase, {
    panel2_heading: String(formData.get("panel2Heading") ?? "").trim() || null,
    panel2_paragraph: String(formData.get("panel2Paragraph") ?? "").trim() || null,
    panel2_cta_label: String(formData.get("panel2CtaLabel") ?? "").trim() || null,
  });
  revalidateCinematic();
}

// Element 10: the repeatable sight-card slider (up to 5 cards).
export async function createSightCardAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  await createSightCard(supabase, {
    kicker: String(formData.get("kicker") ?? "").trim() || null,
    title: String(formData.get("title") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    published: true,
  });
  revalidateCinematic();
}

export async function updateSightCardAction(id: string, formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  await updateSightCard(supabase, id, {
    kicker: String(formData.get("kicker") ?? "").trim() || null,
    title: String(formData.get("title") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    published: formData.get("published") === "on",
  });
  revalidateCinematic();
}

export async function deleteSightCardAction(id: string) {
  await requireUser();
  const supabase = await createClient();
  await deleteSightCard(supabase, id);
  revalidateCinematic();
}

export async function moveSightCardAction(id: string, direction: "up" | "down") {
  await requireUser();
  const supabase = await createClient();
  await moveSightCard(supabase, id, direction);
  revalidateCinematic();
}

// Same reasoning as attachCinematicMediaField above -- the icon file is
// uploaded from the browser straight to Supabase Storage, this just points
// the sight card at the resulting path.
export async function attachSightCardPinAction(id: string, path: string): Promise<MediaActionState> {
  try {
    await requireUser();
    const supabase = await createClient();
    await setSightCardPinIcon(supabase, id, path);
    revalidateCinematic();
    return { error: null };
  } catch (err) {
    return { error: actionErrorMessage(err) };
  }
}

// Word-by-word headline styling. The editor (a client component) manages
// the whole word list locally -- typing into the headline field adds or
// removes a word's settings card automatically -- so this is one
// consolidated save rather than per-word actions: replace the segment
// list and the theme color together in a single call from the editor,
// not a <form action>.
const VALID_TEXT_CASES = new Set(TEXT_CASE_OPTIONS.map((o) => o.value));
const VALID_LAYERS = new Set<HeadlineLayer>(["behind", "normal", "front"]);

export type SaveHeadlineInput = {
  themeColor: string | null;
  segments: HeadlineSegmentSave[];
};

export async function saveHeadlineAction(input: SaveHeadlineInput) {
  await requireUser();
  const supabase = await createClient();

  const segments: HeadlineSegmentSave[] = input.segments
    .map((s) => ({
      id: s.id,
      text: String(s.text ?? "").trim(),
      fontChoice: s.fontChoice ? String(s.fontChoice) : null,
      textCase: VALID_TEXT_CASES.has(s.textCase) ? s.textCase : ("none" as TextCase),
      color: s.color ? String(s.color) : null,
      sizeMultiplier: Number.isFinite(s.sizeMultiplier) ? s.sizeMultiplier : 1,
      offsetX: Number.isFinite(s.offsetX) ? s.offsetX : 0,
      offsetY: Number.isFinite(s.offsetY) ? s.offsetY : 0,
      layer: VALID_LAYERS.has(s.layer) ? s.layer : "normal",
    }))
    .filter((s) => s.text.length > 0);

  await updateCinematicHero(supabase, { headline_theme_color: input.themeColor });
  const saved = await replaceHeadlineSegments(supabase, segments);

  revalidateCinematic();
  return saved;
}
