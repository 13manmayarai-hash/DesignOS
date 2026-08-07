import { Reveal } from "@/components/Reveal";

export function GardenSection() {
  return (
    <section id="garden" className="bg-forest px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-gold-soft">
            The garden
          </p>
          <h2 className="font-display text-3xl leading-tight text-warm-white sm:text-4xl">
            A quiet stretch of green between the rooms and the ridge.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-warm-white/80 sm:text-lg">
            Where the sunrise looks just as good with your feet still in the
            grass.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
