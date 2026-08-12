import type { ReactNode } from "react";

const TONE_CLASS = {
  confirmed: "text-forest",
  pending: "text-gold-ink",
  muted: "text-stone",
  void: "text-stamp-red",
} as const;

export function StampBadge({
  tone,
  children,
}: {
  tone: keyof typeof TONE_CLASS;
  children: ReactNode;
}) {
  return <span className={`ink-stamp ${TONE_CLASS[tone]}`}>{children}</span>;
}
