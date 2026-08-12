import type { CSSProperties, ReactNode } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSettings, type Settings } from "@/lib/data/settings";
import { publicImageUrl } from "@/lib/storage";
import {
  getFontChoice,
  googleFontsStylesheetUrl,
  fontFormatFromPath,
  CUSTOM_FONT_FAMILY,
} from "@/lib/fonts";

const DEFAULT_SETTINGS: Pick<
  Settings,
  "display_font_choice" | "display_font_custom_storage_path" | "display_text_case" | "display_small_caps" | "display_letter_spacing"
> = {
  display_font_choice: "roboto",
  display_font_custom_storage_path: null,
  display_text_case: "none",
  display_small_caps: false,
  display_letter_spacing: 0,
};

// Wraps every public-facing page (the homepage + /book) so the owner's
// chosen display font, case, and letter-spacing apply everywhere -- but
// scoped to this subtree via the "public-shell" class (see globals.css),
// so it never touches /admin, which stays on the fixed Roboto set in the
// root layout.
//
// The font itself can't use next/font -- next/font needs the family known
// at build time, and this is picked at runtime from /admin/settings -- so
// it loads the normal way, via a <link> (curated Google Fonts) or an
// inline @font-face (an uploaded file).
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const supabase = configured ? await createClient() : null;
  const settings = supabase ? await getSettings(supabase) : DEFAULT_SETTINGS;

  const isCustom = settings.display_font_choice === "custom" && settings.display_font_custom_storage_path;
  const fontChoice = isCustom ? null : getFontChoice(settings.display_font_choice);
  const fontFamily = isCustom ? CUSTOM_FONT_FAMILY : fontChoice!.fontFamily;

  return (
    <>
      {isCustom ? (
        <style>{`
          @font-face {
            font-family: '${CUSTOM_FONT_FAMILY}';
            src: url('${publicImageUrl("custom-fonts", settings.display_font_custom_storage_path!)}') format('${fontFormatFromPath(settings.display_font_custom_storage_path!)}');
            font-display: swap;
          }
        `}</style>
      ) : (
        <link rel="stylesheet" href={googleFontsStylesheetUrl([fontChoice!.cssFamily])} />
      )}
      <div
        className="public-shell contents"
        style={
          {
            "--font-display": `'${fontFamily}', var(--font-roboto), system-ui, sans-serif`,
            "--display-text-transform": settings.display_text_case === "none" ? "none" : settings.display_text_case,
            "--display-font-variant-caps": settings.display_small_caps ? "small-caps" : "normal",
            "--display-letter-spacing": `${settings.display_letter_spacing}em`,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </>
  );
}
