import Link from "next/link";
import type { ReactNode } from "react";

// Rectangular, tracked-out uppercase buttons read as boutique-hospitality;
// pill buttons were reading as generic app/SaaS. `tone` picks the outline
// variant's border/text so it stays legible on both dark and light sections.
const base =
  "inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-[180ms] ease-out";

const variants = {
  primary: "bg-gold text-charcoal hover:bg-gold-soft",
  outlineDark:
    "border border-warm-white/35 text-warm-white hover:border-warm-white/70 hover:bg-warm-white/5",
  outlineLight:
    "border border-charcoal/25 text-text-primary hover:border-charcoal/50 hover:bg-charcoal/[0.03]",
} as const;

export function Button({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className ?? ""}`}>
      {children}
    </Link>
  );
}
