// Shared between the public CinematicHero and the admin live preview
// (HeadlineSegmentsEditor) so both lay words out identically -- the admin
// preview is only useful if it actually matches what ships.

export type HeadlineLayer = "behind" | "normal" | "front";

// Behind sits under the mid-ground/glow layers (z 1-2), normal matches the
// plain headline's old z=3, front clears the split-frame/bridge/frame-two
// imagery (z up to 6) but stays under the intro copy and story panels (z
// 9-10) so a word can never cover interactive UI.
export const LAYER_Z_INDEX: Record<HeadlineLayer, number> = {
  behind: 1,
  normal: 3,
  front: 7,
};

// Each word is independently positioned (see the comment on
// .hero-title-word in CinematicHero.module.css for why it can't be a
// shared flex row), so there's no browser layout to fall back on for the
// reading order. This estimates each word's width from its character
// count to lay them out left-to-right by default -- rough (no real font
// metrics), but it's just a starting point the admin's own offsetX/offsetY
// nudge on top of.
export function computeWordAutoLayout<T extends { text: string; sizeMultiplier: number }>(
  segments: T[]
): { segment: T; autoXem: number }[] {
  const GAP_EM = 0.28;
  const widths = segments.map((s) => Math.max(s.text.length, 1) * 0.58 * s.sizeMultiplier);
  const totalEm =
    widths.reduce((sum, w) => sum + w, 0) + GAP_EM * Math.max(segments.length - 1, 0);

  const { rows } = segments.reduce<{
    cursorEm: number;
    rows: { segment: T; autoXem: number }[];
  }>(
    (acc, segment, i) => {
      const centerEm = acc.cursorEm + widths[i] / 2;
      return {
        cursorEm: acc.cursorEm + widths[i] + GAP_EM,
        rows: [...acc.rows, { segment, autoXem: centerEm }],
      };
    },
    { cursorEm: -totalEm / 2, rows: [] }
  );
  return rows;
}

// offsetX/offsetY are in em (relative to the word's own font-size, same
// unit the auto-layout above uses) rather than px -- the headline's
// font-size swings from 14rem down to 4.5rem across the responsive
// breakpoints in the CSS module, and a fixed px nudge would go from subtle
// to wildly oversized between those. em keeps it proportional.
//
// titleY/titleScale default to a static "0px"/"1" for the admin preview
// (no scroll animation there); the public hero passes its own scroll-driven
// CSS variables instead.
export function wordTransform(
  autoXem: number,
  offsetX: number,
  offsetY: number,
  sizeMultiplier: number,
  titleY: string = "0px",
  titleScale: string = "1"
): string {
  return `translate3d(calc(-50% + ${autoXem + offsetX}em), calc(${titleY} + ${offsetY}em), 0) scale(calc(${titleScale} * ${sizeMultiplier}))`;
}
