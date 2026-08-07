import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { SunriseWidget } from "@/components/SunriseWidget";

export function SunriseSection() {
  return (
    <section id="sunrise" className="bg-warm-white px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 sm:items-center sm:gap-16">
        <Reveal>
          <SectionHeading
            index="00"
            eyebrow="The one thing this site sells"
            title="Some mornings, the mountain turns to gold."
          />
          <p className="mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
            Watch it happen from your own balcony, or from the garden with a
            cup of tea in hand.
          </p>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            The clearest window is February to March. Outside those months,
            the valley keeps its own quieter mood -- mist through the pines,
            a slower kind of morning.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <SunriseWidget />
        </Reveal>
      </div>
    </section>
  );
}
