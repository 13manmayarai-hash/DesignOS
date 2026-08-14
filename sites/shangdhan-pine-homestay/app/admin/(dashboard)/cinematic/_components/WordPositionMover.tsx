"use client";

const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";

// em per arrow press -- small enough to nudge a word into place without
// overshooting, which a drag gesture couldn't guarantee.
const NUDGE_STEP = 0.05;

function ArrowButton({
  label,
  glyph,
  onClick,
}: {
  label: string;
  glyph: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center border border-border-default bg-warm-white text-text-primary hover:border-gold-ink hover:bg-sand/20 active:bg-sand/40"
    >
      {glyph}
    </button>
  );
}

// One shared mover for the whole headline rather than a drag-pad per word:
// pick which word is active, then nudge it in small, precise steps -- more
// predictable than dragging a pad, and there's only ever one control to
// scan regardless of how many words the headline has.
export function WordPositionMover({
  words,
  selectedKey,
  onSelect,
  onNudge,
  onReset,
}: {
  words: { key: string; text: string; offsetX: number; offsetY: number }[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onNudge: (dx: number, dy: number) => void;
  onReset: () => void;
}) {
  const selected = words.find((w) => w.key === selectedKey) ?? null;

  return (
    <div className="ledger-panel">
      <p className={labelClass}>Word position</p>
      <p className="mt-1 text-xs text-text-secondary">
        Select a word below, then use the arrows to nudge it -- each press moves it a small,
        precise step.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {words.map((w, i) => (
          <button
            key={w.key}
            type="button"
            onClick={() => onSelect(w.key)}
            aria-pressed={w.key === selectedKey}
            className={`cursor-pointer border px-3 py-1.5 text-sm transition-colors ${
              w.key === selectedKey
                ? "border-charcoal bg-sand/20 text-text-primary"
                : "border-border-default text-text-secondary hover:border-sand-dark"
            }`}
          >
            {i + 1}. {w.text || "(empty)"}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="grid grid-cols-3 grid-rows-3 gap-1">
            <span />
            <ArrowButton label="Move up" glyph="↑" onClick={() => onNudge(0, -NUDGE_STEP)} />
            <span />
            <ArrowButton label="Move left" glyph="←" onClick={() => onNudge(-NUDGE_STEP, 0)} />
            <button
              type="button"
              aria-label="Reset position"
              title="Reset to center"
              onClick={onReset}
              className="flex h-9 w-9 items-center justify-center border border-dashed border-border-default text-text-secondary hover:border-stamp-red hover:text-stamp-red"
            >
              &#8635;
            </button>
            <ArrowButton label="Move right" glyph="→" onClick={() => onNudge(NUDGE_STEP, 0)} />
            <span />
            <ArrowButton label="Move down" glyph="↓" onClick={() => onNudge(0, NUDGE_STEP)} />
            <span />
          </div>
          <div className="font-mono text-xs text-text-secondary">
            <p>x {selected.offsetX.toFixed(2)}</p>
            <p>y {selected.offsetY.toFixed(2)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
