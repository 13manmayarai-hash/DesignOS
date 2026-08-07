import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { nearby, nearbyProvisionalNote } from "@/lib/property-config";

export function NearbySection() {
  return (
    <section id="nearby" className="bg-warm-white px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
            <SectionHeading index="03" eyebrow="Nearby" title="Worth the detour." />
            <span className="font-display text-sm italic text-text-secondary">
              [ Provisional ]
            </span>
          </div>
        </Reveal>

        <Reveal
          delay={0.08}
          className="mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-3"
        >
          {nearby.map((place, i) => (
            <div key={place.name} className="border-t-2 border-gold pt-6">
              <span className="font-display text-sm italic text-gold-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-2xl leading-tight text-text-primary">
                {place.name}
              </h3>
              {place.distanceKm ? (
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
                  About {place.distanceKm} km away
                </p>
              ) : null}
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {place.description}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-12 text-sm text-text-secondary">{nearbyProvisionalNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
