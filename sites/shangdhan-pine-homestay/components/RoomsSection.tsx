import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { rooms } from "@/lib/property-config";

export function RoomsSection() {
  return (
    <section id="rooms" className="bg-surface px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 sm:grid-cols-[1fr_1.1fr] sm:gap-20">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="Rooms"
            title={
              <>
                Every room faces the <em className="italic">mountain</em>.
              </>
            }
          />
          <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary sm:text-lg">
            Each room opens onto a private balcony facing the mountain, with
            its own bathroom, hot water, and a wardrobe for longer stays.
          </p>
        </Reveal>

        <div>
          <div className="divide-y divide-border-default border-y border-border-default">
            {rooms.sharedAmenities.map((amenity, i) => (
              <Reveal key={amenity} delay={0.08 + i * 0.08}>
                <div className="flex items-baseline gap-5 py-5 sm:gap-6">
                  <span className="font-display text-sm italic text-gold-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-text-primary sm:text-base">
                    {amenity}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.08 + rooms.sharedAmenities.length * 0.08}>
            <div className="mt-8 border border-dashed border-sand-dark bg-warm-white/60 px-5 py-4 text-sm text-text-secondary">
              {rooms.note}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
