import { property } from "@/lib/property-config";

export function SiteFooter() {
  return (
    <footer className="bg-charcoal px-6 py-10 text-center sm:px-10">
      <p className="font-display text-lg text-warm-white">{property.name}</p>
      <p className="mt-1 text-sm text-warm-white/60">{property.location}</p>
      <p className="mt-1 text-xs text-warm-white/40">
        Also listed as &ldquo;{property.aka}.&rdquo;
      </p>
    </footer>
  );
}
