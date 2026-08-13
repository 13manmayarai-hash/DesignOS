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
  updateHeadlineSegment,
  deleteHeadlineSegment,
  moveHeadlineSegment,
  setHeadlineSegmentCount,
  type CinematicHero,
  type HeadlineLayer,
} from "@/lib/data/cinematic";
import { randomStoragePath } from "@/lib/storage";
import { TEXT_CASE_OPTIONS, type TextCase } from "@/lib/fonts";

function revalidateCinematic() {
  revalidatePath("/admin/cinematic");
  revalidatePath("/");
}

// Shared by every single-file scene layer (elements 1, 2, 3, 6, 7, 8, 9 in
// the wireframe) -- upload the new file, point the column at it, then clean
// up whatever was there before. Bound to a specific column below so each
// upload <form> just needs a plain file input named "file".
async function uploadCinematicMediaField(
  column: keyof CinematicHero,
  formData: FormData
) {
  await requireUser();
  const supabase = await createClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload");
  }

  const current = await getCinematicHero(supabase);
  const path = randomStoragePath(file.name);
  const { error: uploadError } = await supabase.storage
    .from("cinematic-media")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  await updateCinematicHero(supabase, { [column]: path });

  const previousPath = current[column];
  if (previousPath) {
    await supabase.storage.from("cinematic-media").remove([previousPath]);
  }

  revalidateCinematic();
}

async function removeCinematicMediaField(column: keyof CinematicHero) {
  await requireUser();
  const supabase = await createClient();

  const current = await getCinematicHero(supabase);
  const path = current[column];
  if (path) {
    await supabase.storage.from("cinematic-media").remove([path]);
  }
  await updateCinematicHero(supabase, { [column]: null });

  revalidateCinematic();
}

export const uploadSkyImageAction = uploadCinematicMediaField.bind(null, "sky_image_path");
export const removeSkyImageAction = removeCinematicMediaField.bind(null, "sky_image_path");
export const uploadSkyVideoAction = uploadCinematicMediaField.bind(null, "sky_video_path");
export const removeSkyVideoAction = removeCinematicMediaField.bind(null, "sky_video_path");

export const uploadGlowImageAction = uploadCinematicMediaField.bind(null, "glow_image_path");
export const removeGlowImageAction = removeCinematicMediaField.bind(null, "glow_image_path");
export const uploadMidgroundImageAction = uploadCinematicMediaField.bind(
  null,
  "midground_image_path"
);
export const removeMidgroundImageAction = removeCinematicMediaField.bind(
  null,
  "midground_image_path"
);

export const uploadSplitframeLeftAction = uploadCinematicMediaField.bind(
  null,
  "splitframe_left_path"
);
export const removeSplitframeLeftAction = removeCinematicMediaField.bind(
  null,
  "splitframe_left_path"
);
export const uploadSplitframeRightAction = uploadCinematicMediaField.bind(
  null,
  "splitframe_right_path"
);
export const removeSplitframeRightAction = removeCinematicMediaField.bind(
  null,
  "splitframe_right_path"
);

export const uploadMainImageAction = uploadCinematicMediaField.bind(null, "main_image_path");
export const removeMainImageAction = removeCinematicMediaField.bind(null, "main_image_path");
export const uploadMainVideoAction = uploadCinematicMediaField.bind(null, "main_video_path");
export const removeMainVideoAction = removeCinematicMediaField.bind(null, "main_video_path");

export const uploadCloseupImageAction = uploadCinematicMediaField.bind(
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

export async function uploadSightCardPinAction(id: string, formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const file = formData.get("pin");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an icon to upload");
  }

  const path = randomStoragePath(file.name);
  const { error: uploadError } = await supabase.storage
    .from("cinematic-media")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  await setSightCardPinIcon(supabase, id, path);
  revalidateCinematic();
}

// Word-by-word headline styling: a theme color, a word-count control that
// grows/shrinks the segment list, and per-segment font/size/case/color/
// position/layer.
const VALID_TEXT_CASES = new Set(TEXT_CASE_OPTIONS.map((o) => o.value));
const VALID_LAYERS = new Set<HeadlineLayer>(["behind", "normal", "front"]);

export async function updateHeadlineThemeColorAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const color = String(formData.get("headlineThemeColor") ?? "").trim() || null;
  await updateCinematicHero(supabase, { headline_theme_color: color });
  revalidateCinematic();
}

export async function setHeadlineSegmentCountAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const count = Number(formData.get("wordCount"));
  if (!Number.isFinite(count)) throw new Error("Enter a number of words");
  await setHeadlineSegmentCount(supabase, count);
  revalidateCinematic();
}

export async function updateHeadlineSegmentAction(id: string, formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const textCaseRaw = String(formData.get("textCase") ?? "none");
  const textCase: TextCase = VALID_TEXT_CASES.has(textCaseRaw as TextCase)
    ? (textCaseRaw as TextCase)
    : "none";
  const layerRaw = String(formData.get("layer") ?? "normal");
  const layer: HeadlineLayer = VALID_LAYERS.has(layerRaw as HeadlineLayer)
    ? (layerRaw as HeadlineLayer)
    : "normal";
  const sizeMultiplier = Number(formData.get("sizeMultiplier"));
  const offsetX = Number(formData.get("offsetX"));
  const offsetY = Number(formData.get("offsetY"));

  const useThemeColor = formData.get("useThemeColor") === "on";

  await updateHeadlineSegment(supabase, id, {
    text: String(formData.get("text") ?? ""),
    fontChoice: String(formData.get("fontChoice") ?? "").trim() || null,
    textCase,
    color: useThemeColor ? null : String(formData.get("color") ?? "").trim() || null,
    sizeMultiplier: Number.isFinite(sizeMultiplier) ? sizeMultiplier : 1,
    offsetX: Number.isFinite(offsetX) ? offsetX : 0,
    offsetY: Number.isFinite(offsetY) ? offsetY : 0,
    layer,
  });
  revalidateCinematic();
}

export async function deleteHeadlineSegmentAction(id: string) {
  await requireUser();
  const supabase = await createClient();
  await deleteHeadlineSegment(supabase, id);
  revalidateCinematic();
}

export async function moveHeadlineSegmentAction(id: string, direction: "up" | "down") {
  await requireUser();
  const supabase = await createClient();
  await moveHeadlineSegment(supabase, id, direction);
  revalidateCinematic();
}
