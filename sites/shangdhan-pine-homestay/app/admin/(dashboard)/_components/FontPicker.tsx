"use client";

import { FONT_CHOICES } from "@/lib/fonts";

// A grid/strip of buttons, each rendered in its own actual typeface, so
// choosing a font means looking at the font rather than reading its name
// off a plain <select> list. Doesn't load the Google Fonts stylesheet
// itself -- the caller renders one <link> (see googleFontsStylesheetUrl in
// lib/fonts.ts) so multiple pickers on one page don't each duplicate it.
export function FontPicker({
  value,
  onChange,
  customFontFamily,
  compact = false,
}: {
  value: string;
  onChange: (id: string) => void;
  customFontFamily?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex flex-wrap gap-1.5" : "grid gap-2 sm:grid-cols-2"}>
      {FONT_CHOICES.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          aria-pressed={value === f.id}
          className={`cursor-pointer border leading-tight text-text-primary transition-colors ${
            compact ? "px-2.5 py-1.5 text-sm" : "px-4 py-3 text-lg"
          } ${
            value === f.id
              ? "border-charcoal bg-sand/20"
              : "border-border-default hover:border-sand-dark"
          }`}
          style={{ fontFamily: `'${f.fontFamily}', system-ui, sans-serif` }}
        >
          {f.label}
        </button>
      ))}
      {customFontFamily ? (
        <button
          type="button"
          onClick={() => onChange("custom")}
          aria-pressed={value === "custom"}
          className={`cursor-pointer border leading-tight text-text-primary transition-colors ${
            compact ? "px-2.5 py-1.5 text-sm" : "px-4 py-3 text-lg"
          } ${
            value === "custom"
              ? "border-charcoal bg-sand/20"
              : "border-border-default hover:border-sand-dark"
          }`}
          style={{ fontFamily: `'${customFontFamily}', system-ui, sans-serif` }}
        >
          Your uploaded font
        </button>
      ) : null}
    </div>
  );
}
