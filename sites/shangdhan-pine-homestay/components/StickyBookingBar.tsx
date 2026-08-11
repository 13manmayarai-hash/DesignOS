import Link from "next/link";

// Book 10 Ch13 -- mobile prioritizes booking with a sticky CTA. Hidden on
// larger screens, where the in-page Book section is already in view.
export function StickyBookingBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-surface/95 px-4 py-3 backdrop-blur sm:hidden">
      <Link
        href="/book"
        className="block w-full bg-forest px-6 py-3.5 text-center text-xs font-medium uppercase tracking-[0.18em] text-warm-white"
      >
        Book Your Stay
      </Link>
    </div>
  );
}
