"use client";

import { whatsappLink, property } from "@/lib/property-config";

const INQUIRY_MESSAGE = `Hi! I'd like to check availability at ${property.name}.`;

// Book 10 Ch13 -- mobile prioritizes booking with a sticky CTA. Hidden on
// larger screens, where the in-page Book section is already in view.
export function StickyBookingBar() {
  const link = whatsappLink(INQUIRY_MESSAGE);
  if (!link) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-surface/95 px-4 py-3 backdrop-blur sm:hidden">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-forest px-6 py-3.5 text-center text-xs font-medium uppercase tracking-[0.18em] text-warm-white"
      >
        Check Availability on WhatsApp
      </a>
    </div>
  );
}
