// Curated set of Google Fonts the owner can pick for the public site's
// display type (headings, hero headline) from /admin/settings. Kept as a
// fixed list rather than free text -- next/font can't load an
// admin-chosen font at build time, so these load at runtime via the
// Google Fonts CSS2 API instead (see app/(public)/layout.tsx). "custom"
// isn't in this list -- it's a separate uploaded-file path stored on
// settings.display_font_custom_storage_path.
export type FontChoice = {
  id: string;
  label: string;
  category: "serif" | "sans" | "display" | "cursive";
  // Google Fonts CSS2 family query, e.g. "Playfair+Display:wght@600;700"
  cssFamily: string;
  // The actual font-family name as it appears in the loaded stylesheet.
  fontFamily: string;
};

export const FONT_CHOICES: FontChoice[] = [
  { id: "roboto", label: "Roboto", category: "sans", cssFamily: "Roboto:wght@500;700;900", fontFamily: "Roboto" },
  { id: "cormorant-garamond", label: "Cormorant Garamond", category: "serif", cssFamily: "Cormorant+Garamond:wght@500;600;700", fontFamily: "Cormorant Garamond" },
  { id: "playfair-display", label: "Playfair Display", category: "serif", cssFamily: "Playfair+Display:wght@600;700;800", fontFamily: "Playfair Display" },
  { id: "montserrat", label: "Montserrat", category: "sans", cssFamily: "Montserrat:wght@500;700;800", fontFamily: "Montserrat" },
  { id: "poppins", label: "Poppins", category: "sans", cssFamily: "Poppins:wght@500;600;700", fontFamily: "Poppins" },
  { id: "bebas-neue", label: "Bebas Neue", category: "display", cssFamily: "Bebas+Neue", fontFamily: "Bebas Neue" },
  { id: "abril-fatface", label: "Abril Fatface", category: "display", cssFamily: "Abril+Fatface", fontFamily: "Abril Fatface" },
  { id: "dancing-script", label: "Dancing Script", category: "cursive", cssFamily: "Dancing+Script:wght@600;700", fontFamily: "Dancing Script" },
  { id: "great-vibes", label: "Great Vibes", category: "cursive", cssFamily: "Great+Vibes", fontFamily: "Great Vibes" },
  { id: "pacifico", label: "Pacifico", category: "cursive", cssFamily: "Pacifico", fontFamily: "Pacifico" },
];

export const DEFAULT_FONT_CHOICE_ID = "roboto";

export function getFontChoice(id: string): FontChoice {
  return FONT_CHOICES.find((f) => f.id === id) ?? FONT_CHOICES.find((f) => f.id === DEFAULT_FONT_CHOICE_ID)!;
}

export const TEXT_CASE_OPTIONS = [
  { value: "none", label: "As typed" },
  { value: "uppercase", label: "UPPERCASE" },
  { value: "lowercase", label: "lowercase" },
  { value: "capitalize", label: "Capitalize Each Word" },
] as const;

export type TextCase = (typeof TEXT_CASE_OPTIONS)[number]["value"];

export function googleFontsStylesheetUrl(cssFamilies: string[]): string {
  const params = cssFamilies.map((f) => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

// The @font-face family name used for an uploaded custom font, both in the
// admin preview and on the public site -- fixed rather than derived from
// the filename since there's only ever one custom font active at a time.
export const CUSTOM_FONT_FAMILY = "Custom Display Font";

export function fontFormatFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "woff2":
      return "woff2";
    case "woff":
      return "woff";
    case "ttf":
      return "truetype";
    case "otf":
      return "opentype";
    default:
      return "woff2";
  }
}
