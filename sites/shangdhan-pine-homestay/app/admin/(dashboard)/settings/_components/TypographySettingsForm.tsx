"use client";

import { useState, type CSSProperties } from "react";
import { FONT_CHOICES, TEXT_CASE_OPTIONS, googleFontsStylesheetUrl, type TextCase } from "@/lib/fonts";
import { SubmitButton } from "../../_components/SubmitButton";
import { FontPicker } from "../../_components/FontPicker";

const inputClass =
  "mt-1.5 w-full max-w-sm border border-border-default bg-warm-white px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-ink";
const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";
const saveButtonClass =
  "bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-warm-white hover:bg-charcoal/90";

const PREVIEW_TEXT = "Shangdhan Pine Homestay";

export function TypographySettingsForm({
  action,
  initialFontChoice,
  initialTextCase,
  initialSmallCaps,
  initialLetterSpacing,
  customFontFamily,
}: {
  action: (formData: FormData) => Promise<void>;
  initialFontChoice: string;
  initialTextCase: TextCase;
  initialSmallCaps: boolean;
  initialLetterSpacing: number;
  customFontFamily: string | null;
}) {
  const [fontChoice, setFontChoice] = useState(initialFontChoice);
  const [textCase, setTextCase] = useState<TextCase>(initialTextCase);
  const [smallCaps, setSmallCaps] = useState(initialSmallCaps);
  const [letterSpacing, setLetterSpacing] = useState(initialLetterSpacing);

  const previewFontFamily =
    fontChoice === "custom"
      ? (customFontFamily ?? "inherit")
      : (FONT_CHOICES.find((f) => f.id === fontChoice)?.fontFamily ?? "inherit");

  const previewStyle: CSSProperties = {
    fontFamily: `'${previewFontFamily}', system-ui, sans-serif`,
    textTransform: textCase === "none" ? undefined : textCase,
    fontVariantCaps: smallCaps ? "small-caps" : undefined,
    letterSpacing: `${letterSpacing}em`,
  };

  return (
    <>
      {/* Loads every curated font so the picker cards below preview in their
          real typeface, not a fallback -- admin-only cost, doesn't touch the
          public site's font loading (see app/(public)/layout.tsx). */}
      <link rel="stylesheet" href={googleFontsStylesheetUrl(FONT_CHOICES.map((f) => f.cssFamily))} />

      <form action={action} className="mt-5 space-y-6">
        <div>
          <p className={labelClass}>Display font</p>
          <input type="hidden" name="displayFontChoice" value={fontChoice} />
          <div className="mt-2">
            <FontPicker value={fontChoice} onChange={setFontChoice} customFontFamily={customFontFamily} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="displayTextCase" className={labelClass}>
              Letter case
            </label>
            <select
              id="displayTextCase"
              name="displayTextCase"
              value={textCase}
              onChange={(e) => setTextCase(e.target.value as TextCase)}
              className={inputClass}
            >
              {TEXT_CASE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-xs font-medium uppercase tracking-[0.1em] text-text-secondary">
            <input
              type="checkbox"
              name="displaySmallCaps"
              checked={smallCaps}
              onChange={(e) => setSmallCaps(e.target.checked)}
              className="h-4 w-4"
            />
            Small caps
          </label>
        </div>

        <div>
          <label htmlFor="displayLetterSpacing" className={labelClass}>
            Letter spacing ({letterSpacing.toFixed(2)}em) -- negative values overlap the letters
          </label>
          <input
            id="displayLetterSpacing"
            type="range"
            name="displayLetterSpacing"
            min={-0.05}
            max={0.3}
            step={0.01}
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(Number(e.target.value))}
            className="mt-2 w-full max-w-sm"
          />
        </div>

        <div className="border border-border-default bg-warm-white p-6">
          <p className={labelClass}>Live preview</p>
          <p className="mt-3 text-4xl text-text-primary" style={previewStyle}>
            {PREVIEW_TEXT}
          </p>
        </div>

        <SubmitButton pendingLabel="Saving..." className={saveButtonClass}>
          Save typography
        </SubmitButton>
      </form>
    </>
  );
}
