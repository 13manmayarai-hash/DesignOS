"use client";

import { useSyncExternalStore } from "react";
import {
  approximateSunrise,
  formatSunriseTime,
  seasonalNoteForDate,
  MONTH_NAMES,
} from "@/lib/sunrise";

// Reads "today" from the client clock without a hydration mismatch: the
// server snapshot is null (renders a loading state), the client snapshot
// is the real current date. useSyncExternalStore requires a referentially
// stable snapshot, so the Date is read once and cached -- a fresh `new
// Date()` on every call would look like a perpetual external change and
// loop renders.
let cachedClientNow: Date | null = null;
function subscribe() {
  return () => {};
}
function getClientSnapshot() {
  if (!cachedClientNow) cachedClientNow = new Date();
  return cachedClientNow;
}
function getServerSnapshot() {
  return null;
}

// Computed client-side from the current date -- real astronomical math, no
// live weather claim. See lib/sunrise.ts for the honesty note.
export function SunriseWidget() {
  const now = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!now) {
    return (
      <div className="h-24 animate-pulse rounded-2xl bg-sand/40" aria-hidden />
    );
  }

  const sunrise = approximateSunrise(now);
  const season = seasonalNoteForDate(now);
  const month = MONTH_NAMES[now.getMonth()];

  return (
    <div className="rounded-2xl border border-border-default bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-4xl text-forest sm:text-5xl">
          {sunrise ? formatSunriseTime(sunrise) : "--"}
        </span>
        <span className="text-sm text-text-secondary">
          approximate sunrise today, Lower Kaffer
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
        You&apos;re visiting in {month} -- this is{" "}
        <strong className="text-text-primary">
          {season.inWindow ? "inside" : "outside"} the clearest window
          (Feb-Mar)
        </strong>
        . {season.note}.
      </p>
    </div>
  );
}
