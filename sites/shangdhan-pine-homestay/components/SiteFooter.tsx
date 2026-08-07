import Link from "next/link";
import { property } from "@/lib/property-config";

const EXPLORE_LINKS = [
  { href: "#rooms", label: "Rooms" },
  { href: "#host", label: "Host" },
  { href: "#garden", label: "Garden" },
  { href: "#nearby", label: "Nearby" },
  { href: "#practical", label: "Practical details" },
];

export function SiteFooter() {
  return (
    <footer className="bg-charcoal px-6 pt-20 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-14 border-t border-warm-white/10 pt-14 sm:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl text-warm-white">{property.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-warm-white/55">
            {property.location}
          </p>
          <p className="mt-2 text-xs text-warm-white/35">
            Also listed as &ldquo;{property.aka}.&rdquo;
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-warm-white/40">
            Explore
          </p>
          <ul className="mt-5 space-y-3">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-warm-white/70 transition-colors duration-[180ms] ease-out hover:text-warm-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-warm-white/40">
            Visit
          </p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-warm-white/70">
            Best seen February through March, when the mountain clears at
            sunrise.
          </p>
          <Link
            href="#book"
            className="mt-5 inline-block text-xs font-medium uppercase tracking-[0.18em] text-gold-soft transition-colors duration-[180ms] ease-out hover:text-warm-white"
          >
            Check availability &rarr;
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl border-t border-warm-white/10 py-8">
        <p className="text-xs text-warm-white/35">{property.name}</p>
      </div>
    </footer>
  );
}
