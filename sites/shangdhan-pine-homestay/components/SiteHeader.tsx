"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { property } from "@/lib/property-config";

const BASE_NAV_LINKS = [
  { href: "#rooms", label: "Rooms" },
  { href: "#host", label: "Host" },
  { href: "#garden", label: "Garden" },
];

const GALLERY_LINK = { href: "#gallery", label: "Gallery" };

const TAIL_NAV_LINKS = [{ href: "#nearby", label: "Nearby" }];

// Transparent over the hero, solid once scrolled past it -- a persistent
// nav reads as more considered than the single absolute bar it replaces.
export function SiteHeader({ showGallery = false }: { showGallery?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const navLinks = [
    ...BASE_NAV_LINKS,
    ...(showGallery ? [GALLERY_LINK] : []),
    ...TAIL_NAV_LINKS,
  ];

  useEffect(() => {
    const threshold = () => Math.min(window.innerHeight * 0.75, 640);
    const onScroll = () => setScrolled(window.scrollY > threshold());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,box-shadow] duration-[240ms] ease-out ${
        scrolled
          ? "border-b border-border-default bg-warm-white/95 shadow-[0_1px_0_0_rgba(38,34,32,0.02)] backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="#"
          className={`font-display text-lg tracking-tight ${
            scrolled ? "text-text-primary" : "text-warm-white"
          }`}
        >
          {property.name}
        </Link>

        <nav
          className={`hidden items-center gap-9 text-xs font-medium uppercase tracking-[0.16em] md:flex ${
            scrolled ? "text-text-secondary" : "text-warm-white/80"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative pb-1 transition-colors duration-[180ms] ease-out ${
                scrolled ? "hover:text-text-primary" : "hover:text-warm-white"
              }`}
            >
              {link.label}
              <span
                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-[240ms] ease-out group-hover:scale-x-100"
                aria-hidden
              />
            </Link>
          ))}
        </nav>

        <Link
          href="#book"
          className={`px-6 py-2.5 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-[180ms] ease-out ${
            scrolled
              ? "border border-charcoal/25 text-text-primary hover:border-charcoal/50"
              : "border border-warm-white/35 text-warm-white hover:border-warm-white/70"
          }`}
        >
          Book
        </Link>
      </div>
    </header>
  );
}
