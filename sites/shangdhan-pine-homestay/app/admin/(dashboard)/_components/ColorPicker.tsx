"use client";

// Swatches pulled from the site's own design tokens (globals.css) rather
// than a generic rainbow -- picking a color here should mean picking one
// that already belongs to the brand, with a custom picker as the escape
// hatch rather than the default.
const PALETTE = [
  { label: "Warm white", hex: "#fbf7f1" },
  { label: "Sand", hex: "#e8dcc8" },
  { label: "Gold", hex: "#c9a24b" },
  { label: "Gold ink", hex: "#8a6423" },
  { label: "Forest", hex: "#2f4a3c" },
  { label: "Charcoal", hex: "#262220" },
  { label: "Stamp red", hex: "#9a3324" },
  { label: "White", hex: "#ffffff" },
];

const RAINBOW =
  "conic-gradient(from 90deg, #f43f5e, #f59e0b, #eab308, #84cc16, #10b981, #06b6d4, #3b82f6, #8b5cf6, #f43f5e)";

// value === null means "use the theme color" (only offered when a
// themeColor is passed in -- per-word colors on the headline can fall
// back to it, but the site-wide typography picker has no such fallback).
export function ColorPicker({
  value,
  onChange,
  themeColor,
}: {
  value: string | null;
  onChange: (color: string | null) => void;
  themeColor?: string | null;
}) {
  const isPaletteColor = value !== null && PALETTE.some((p) => p.hex.toLowerCase() === value.toLowerCase());
  const isCustomActive = value !== null && !isPaletteColor;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {themeColor ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          title={`Use theme color (${themeColor})`}
          aria-pressed={value === null}
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
            value === null ? "border-charcoal" : "border-transparent hover:border-sand-dark"
          }`}
        >
          <span
            className="h-6 w-6 rounded-full border border-border-default"
            style={{ background: themeColor }}
          />
        </button>
      ) : null}

      {PALETTE.map((p) => (
        <button
          key={p.hex}
          type="button"
          title={p.label}
          aria-pressed={value?.toLowerCase() === p.hex.toLowerCase()}
          onClick={() => onChange(p.hex)}
          className={`h-8 w-8 rounded-full border-2 transition-colors ${
            value?.toLowerCase() === p.hex.toLowerCase()
              ? "border-charcoal"
              : "border-transparent hover:border-sand-dark"
          }`}
          style={{ background: p.hex }}
        />
      ))}

      <label
        title="Custom color"
        aria-pressed={isCustomActive}
        className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 ${
          isCustomActive ? "border-charcoal" : "border-transparent hover:border-sand-dark"
        }`}
        style={{ background: isCustomActive ? value! : RAINBOW }}
      >
        <input
          type="color"
          value={isCustomActive ? value! : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>

      {value ? (
        <span className="font-mono text-xs text-text-secondary">{value}</span>
      ) : null}
    </div>
  );
}
