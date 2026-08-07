import Link from "next/link";
import { property } from "@/lib/property-config";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 sm:px-10">
      <span className="font-display text-lg text-warm-white">
        {property.name}
      </span>
      <Link
        href="#book"
        className="rounded-full border border-warm-white/40 px-5 py-2 text-xs font-medium text-warm-white transition-colors duration-[180ms] ease-out hover:bg-warm-white/10"
      >
        Book
      </Link>
    </header>
  );
}
