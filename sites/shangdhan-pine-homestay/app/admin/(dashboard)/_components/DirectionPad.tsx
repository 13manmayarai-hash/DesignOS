"use client";

import { useCallback, useRef, type PointerEvent } from "react";

// em on each axis from center to edge -- matches the offsetX/offsetY
// range the headline segments used with plain number inputs before this.
const RANGE = 5;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// A small drag pad standing in for the old separate "left/right" and
// "up/down" number fields -- one gesture sets both axes at once, which is
// what "direction control" actually calls for.
export function DirectionPad({
  x,
  y,
  onChange,
}: {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const padRef = useRef<HTMLDivElement>(null);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const pad = padRef.current;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const px = clamp((clientX - rect.left) / rect.width, 0, 1);
      const py = clamp((clientY - rect.top) / rect.height, 0, 1);
      onChange(Number(((px - 0.5) * 2 * RANGE).toFixed(2)), Number(((py - 0.5) * 2 * RANGE).toFixed(2)));
    },
    [onChange]
  );

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  }
  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1) return;
    updateFromPointer(e.clientX, e.clientY);
  }

  const dotLeft = clamp((x / RANGE) * 0.5 + 0.5, 0, 1) * 100;
  const dotTop = clamp((y / RANGE) * 0.5 + 0.5, 0, 1) * 100;

  return (
    <div className="flex items-center gap-3">
      <div
        ref={padRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        role="slider"
        aria-label="Word position"
        aria-valuemin={-5}
        aria-valuemax={RANGE}
        aria-valuenow={x}
        aria-valuetext={`x ${x.toFixed(1)}, y ${y.toFixed(1)}`}
        tabIndex={0}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 1 : 0.2;
          if (e.key === "ArrowLeft") onChange(Number((x - step).toFixed(2)), y);
          else if (e.key === "ArrowRight") onChange(Number((x + step).toFixed(2)), y);
          else if (e.key === "ArrowUp") onChange(x, Number((y - step).toFixed(2)));
          else if (e.key === "ArrowDown") onChange(x, Number((y + step).toFixed(2)));
          else return;
          e.preventDefault();
        }}
        className="relative h-20 w-20 shrink-0 cursor-crosshair touch-none border border-border-default bg-warm-white outline-none focus-visible:border-gold-ink"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-sand" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-sand" />
        <div
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-warm-white bg-gold-ink shadow"
          style={{ left: `${dotLeft}%`, top: `${dotTop}%` }}
        />
      </div>
      <div className="font-mono text-[11px] leading-relaxed text-text-secondary">
        <p>x {x.toFixed(1)}</p>
        <p>y {y.toFixed(1)}</p>
        <button
          type="button"
          onClick={() => onChange(0, 0)}
          className="underline decoration-dotted hover:text-text-primary"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
