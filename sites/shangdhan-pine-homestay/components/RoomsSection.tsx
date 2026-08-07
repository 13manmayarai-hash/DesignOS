import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { rooms } from "@/lib/property-config";

export function RoomsSection() {
  return (
    <section id="rooms" className="bg-surface px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="Rooms" title="Every room faces the mountain." />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Each room opens onto a private balcony facing the mountain, with
            its own bathroom, hot water, and a wardrobe for longer stays.
            Free WiFi reaches every room, for the mornings you want to share
            the view, and the evenings you&apos;d rather not.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 grid gap-4 sm:grid-cols-2">
          {rooms.sharedAmenities.map((amenity) => (
            <div
              key={amenity}
              className="rounded-xl border border-border-default bg-warm-white px-5 py-4 text-sm text-text-primary sm:text-base"
            >
              {amenity}
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 rounded-xl border border-dashed border-sand-dark bg-warm-white/60 px-5 py-4 text-sm text-text-secondary">
            Room names, sizes and nightly rates are still being confirmed
            with the property -- {rooms.note}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
