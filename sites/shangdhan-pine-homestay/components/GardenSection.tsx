import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export function GardenSection() {
  return (
    <section id="garden" className="bg-forest px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="The garden"
            title="A quiet stretch of green between the rooms and the ridge."
            dark
            center
          />
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-warm-white/75 sm:text-lg">
            Where the sunrise looks just as good with your feet still in the
            grass.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
