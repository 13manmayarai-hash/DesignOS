"use client";

import { useRef, useState, useTransition, type CSSProperties } from "react";
import {
  FONT_CHOICES,
  TEXT_CASE_OPTIONS,
  googleFontsStylesheetUrl,
  type TextCase,
} from "@/lib/fonts";
import {
  HEADLINE_LAYER_OPTIONS,
  type HeadlineLayer,
  type HeadlineSegment,
  type HeadlineSegmentSave,
} from "@/lib/data/cinematic";
import { computeWordAutoLayout, wordTransform } from "@/lib/headline-layout";
import { FontPicker } from "../../_components/FontPicker";
import { ColorPicker } from "../../_components/ColorPicker";
import { WordPositionMover } from "./WordPositionMover";
import type { SaveHeadlineInput } from "../actions";

const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";
const inputClass =
  "mt-1.5 w-full max-w-md border border-border-default bg-warm-white px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-ink";

const CASE_GLYPHS: Record<TextCase, string> = {
  none: "Aa",
  uppercase: "AB",
  lowercase: "ab",
  capitalize: "Ab Cd",
};

// The fixed font-size every preview word renders at -- sizeMultiplier is
// applied via transform: scale(), same as the public hero, so it must NOT
// also be baked into this font-size or it'd be applied twice.
const PREVIEW_FONT_SIZE_REM = 2.6;
// Matches CinematicHero.module.css's .stage fallback background, so the
// preview reads correctly against the same sky color words are designed
// against on the public site.
const PREVIEW_BACKGROUND = "#7fb4d4";

type LocalWord = {
  key: string;
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

function toLocalWord(s: HeadlineSegment): LocalWord {
  return {
    key: s.id,
    id: s.id,
    text: s.text,
    fontChoice: s.font_choice,
    textCase: s.text_case,
    color: s.color,
    sizeMultiplier: s.size_multiplier,
    offsetX: s.offset_x,
    offsetY: s.offset_y,
    layer: s.layer,
  };
}

function toSegmentSave(w: LocalWord): HeadlineSegmentSave {
  return {
    id: w.id,
    text: w.text,
    fontChoice: w.fontChoice,
    textCase: w.textCase,
    color: w.color,
    sizeMultiplier: w.sizeMultiplier,
    offsetX: w.offsetX,
    offsetY: w.offsetY,
    layer: w.layer,
  };
}

function defaultWordSettings(text: string, key: string): LocalWord {
  return {
    key,
    id: null,
    text,
    fontChoice: null,
    textCase: "none",
    color: null,
    sizeMultiplier: 1,
    offsetX: 0,
    offsetY: 0,
    layer: "normal",
  };
}

function resolveFontFamily(fontChoice: string | null, customFontFamily: string | null): string {
  if (fontChoice === "custom") return customFontFamily ?? "inherit";
  if (fontChoice) return FONT_CHOICES.find((f) => f.id === fontChoice)?.fontFamily ?? "inherit";
  return "inherit";
}

export function HeadlineSegmentsEditor({
  initialSegments,
  initialThemeColor,
  customFontFamily,
  saveAction,
}: {
  initialSegments: HeadlineSegment[];
  initialThemeColor: string | null;
  customFontFamily: string | null;
  saveAction: (input: SaveHeadlineInput) => Promise<HeadlineSegment[]>;
}) {
  const [headlineText, setHeadlineText] = useState(initialSegments.map((s) => s.text).join(" "));
  const [words, setWords] = useState<LocalWord[]>(initialSegments.map(toLocalWord));
  const [themeColor, setThemeColor] = useState<string | null>(initialThemeColor ?? "#fdf1e1");
  const [selectedWordKey, setSelectedWordKey] = useState<string | null>(
    initialSegments[0]?.id ?? null
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const newKeyCounter = useRef(0);

  function nextNewKey() {
    newKeyCounter.current += 1;
    return `new-${newKeyCounter.current}`;
  }

  // Words are never edited as a list of their own -- typing (or deleting)
  // a word in the headline text is the only way the word list changes, so
  // each settings card's own text field is read-only display, and this is
  // the single place word count is derived. Matching is positional (word i
  // keeps word i's settings) rather than by identity, which is a
  // deliberate simplification: good enough for headlines a few words long,
  // where inserting a word in the middle is rare.
  function handleHeadlineTextChange(text: string) {
    setHeadlineText(text);
    const tokens = text.split(/\s+/).filter(Boolean);
    const newWords = tokens.map((token, i) => {
      const existing = words[i];
      return existing ? { ...existing, text: token } : defaultWordSettings(token, nextNewKey());
    });
    setWords(newWords);
    setSelectedWordKey((prev) =>
      prev && newWords.some((w) => w.key === prev) ? prev : (newWords[0]?.key ?? null)
    );
  }

  function updateWord(key: string, patch: Partial<LocalWord>) {
    setWords((prev) => prev.map((w) => (w.key === key ? { ...w, ...patch } : w)));
  }

  function nudgeSelectedWord(dx: number, dy: number) {
    if (!selectedWordKey) return;
    setWords((prev) =>
      prev.map((w) =>
        w.key === selectedWordKey
          ? {
              ...w,
              offsetX: Number((w.offsetX + dx).toFixed(2)),
              offsetY: Number((w.offsetY + dy).toFixed(2)),
            }
          : w
      )
    );
  }

  function resetSelectedWordPosition() {
    if (!selectedWordKey) return;
    updateWord(selectedWordKey, { offsetX: 0, offsetY: 0 });
  }

  function handleSave() {
    setSaveError(null);
    const selectedIndex = words.findIndex((w) => w.key === selectedWordKey);
    startTransition(async () => {
      try {
        const saved = await saveAction({ themeColor, segments: words.map(toSegmentSave) });
        const savedWords = saved.map(toLocalWord);
        setWords(savedWords);
        setHeadlineText(saved.map((s) => s.text).join(" "));
        setSelectedWordKey(savedWords[selectedIndex]?.key ?? savedWords[0]?.key ?? null);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  const autoLayout = computeWordAutoLayout(words);

  return (
    <div className="space-y-4">
      {/* Loads every curated font once so both the per-word FontPicker cards
          and the live preview below render in each font's real typeface. */}
      <link rel="stylesheet" href={googleFontsStylesheetUrl(FONT_CHOICES.map((f) => f.cssFamily))} />

      <div className="ledger-panel">
        <label htmlFor="headlineWords" className={labelClass}>
          Headline
        </label>
        <input
          id="headlineWords"
          value={headlineText}
          onChange={(e) => handleHeadlineTextChange(e.target.value)}
          placeholder="KAFFER"
          className={inputClass}
        />
        <p className="mt-2 text-xs text-text-secondary">
          A settings card appears below for each word automatically as you type -- no separate
          word count to manage. Leave this empty to fall back to the plain headline above.
        </p>

        <div className="mt-4">
          <p className={labelClass}>Theme color</p>
          <p className="mt-1 text-xs text-text-secondary">
            The default color every word uses unless it picks its own color below.
          </p>
          <div className="mt-2">
            <ColorPicker value={themeColor} onChange={setThemeColor} />
          </div>
        </div>
      </div>

      <div className="ledger-panel">
        <p className={labelClass}>Live preview</p>
        <div
          className="relative mt-2 h-56 w-full overflow-hidden border border-border-default"
          style={{ background: PREVIEW_BACKGROUND }}
        >
          {words.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
              Type a headline above to preview it here.
            </p>
          ) : (
            autoLayout.map(({ segment: w, autoXem }) => {
              const style: CSSProperties = {
                position: "absolute",
                left: "50%",
                top: "50%",
                fontSize: `${PREVIEW_FONT_SIZE_REM}rem`,
                fontFamily: `'${resolveFontFamily(w.fontChoice, customFontFamily)}', system-ui, sans-serif`,
                textTransform: w.textCase === "none" ? undefined : w.textCase,
                color: w.color ?? themeColor ?? "#fdf1e1",
                transform: wordTransform(autoXem, w.offsetX, w.offsetY, w.sizeMultiplier),
                whiteSpace: "nowrap",
                lineHeight: 1,
                fontWeight: 700,
              };
              return (
                <span key={w.key} style={style}>
                  {w.text}
                </span>
              );
            })
          )}
        </div>
      </div>

      {words.length > 0 ? (
        <WordPositionMover
          words={words}
          selectedKey={selectedWordKey}
          onSelect={setSelectedWordKey}
          onNudge={nudgeSelectedWord}
          onReset={resetSelectedWordPosition}
        />
      ) : null}

      {words.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {words.map((w, i) => (
            <div
              key={w.key}
              className={`ledger-panel space-y-3 ${
                w.key === selectedWordKey ? "ring-1 ring-inset ring-gold-ink" : ""
              }`}
            >
              <p className="text-sm font-medium text-text-primary">
                Word {i + 1}: &ldquo;{w.text}&rdquo;
              </p>

              <div>
                <p className={labelClass}>Font</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateWord(w.key, { fontChoice: null })}
                    aria-pressed={w.fontChoice === null}
                    className={`cursor-pointer border px-2.5 py-1.5 text-sm leading-tight text-text-primary transition-colors ${
                      w.fontChoice === null
                        ? "border-charcoal bg-sand/20"
                        : "border-border-default hover:border-sand-dark"
                    }`}
                  >
                    Site font
                  </button>
                </div>
                <div className="mt-1.5">
                  <FontPicker
                    value={w.fontChoice ?? ""}
                    onChange={(id) => updateWord(w.key, { fontChoice: id })}
                    customFontFamily={customFontFamily}
                    compact
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`size-${w.key}`} className={labelClass}>
                  Size ({w.sizeMultiplier.toFixed(2)}&times;)
                </label>
                <input
                  id={`size-${w.key}`}
                  type="range"
                  min={0.2}
                  max={3}
                  step={0.05}
                  value={w.sizeMultiplier}
                  onChange={(e) => updateWord(w.key, { sizeMultiplier: Number(e.target.value) })}
                  className="mt-1.5 w-full max-w-xs"
                />
              </div>

              <div>
                <p className={labelClass}>Letter case</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {TEXT_CASE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      title={o.label}
                      aria-pressed={w.textCase === o.value}
                      onClick={() => updateWord(w.key, { textCase: o.value })}
                      className={`cursor-pointer border px-3 py-1.5 text-sm transition-colors ${
                        w.textCase === o.value
                          ? "border-charcoal bg-sand/20 text-text-primary"
                          : "border-border-default text-text-secondary hover:border-sand-dark"
                      }`}
                    >
                      {CASE_GLYPHS[o.value]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className={labelClass}>Color</p>
                <div className="mt-1.5">
                  <ColorPicker
                    value={w.color}
                    onChange={(c) => updateWord(w.key, { color: c })}
                    themeColor={themeColor}
                  />
                </div>
              </div>

              <div>
                <p className={labelClass}>Layer</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {HEADLINE_LAYER_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      title={o.label}
                      aria-pressed={w.layer === o.value}
                      onClick={() => updateWord(w.key, { layer: o.value })}
                      className={`cursor-pointer border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.06em] transition-colors ${
                        w.layer === o.value
                          ? "border-charcoal bg-sand/20 text-text-primary"
                          : "border-border-default text-text-secondary hover:border-sand-dark"
                      }`}
                    >
                      {o.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-warm-white hover:bg-charcoal/90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save headline styling"}
        </button>
        {saveError ? <p className="text-xs font-medium text-stamp-red">{saveError}</p> : null}
      </div>
    </div>
  );
}
