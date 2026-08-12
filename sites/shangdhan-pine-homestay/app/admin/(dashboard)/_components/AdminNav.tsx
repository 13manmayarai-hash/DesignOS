"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/cinematic", label: "Cinematic" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row overflow-x-auto lg:flex-col lg:overflow-visible">
      {LINKS.map((link) => {
        const active = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border-b-2 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-150 ease-out lg:border-b-0 lg:border-l-2 ${
              active
                ? "border-gold-ink bg-sand/30 text-text-primary"
                : "border-transparent text-text-secondary hover:border-sand-dark hover:text-text-primary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
