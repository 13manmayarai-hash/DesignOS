import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { nearby, nearbyProvisionalNote } from "@/lib/property-config";

export function NearbySection() {
  return (
    <section id="nearby" className="bg-warm-white px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <SectionHeading eyebrow="Nearby" title="Worth the detour." />
            <span className="rounded-full border border-sand-dark px-3 py-1 text-xs font-medium text-text-secondary">
              Provisional
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 grid gap-6 sm:grid-cols-3">
          {nearby.map((place) => (
            <div key={place.name} className="rounded-2xl bg-surface p-6">
              <h3 className="font-display text-xl text-text-primary">
                {place.name}
              </h3>
              {place.distanceKm ? (
                <p className="mt-1 text-xs uppercase tracking-wide text-gold-ink">
                  About {place.distanceKm} km away
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {place.description}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-8 text-sm text-text-secondary">{nearbyProvisionalNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
