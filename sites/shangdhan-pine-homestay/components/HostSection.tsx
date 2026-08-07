import { Reveal } from "@/components/Reveal";
import { hostQuote } from "@/lib/property-config";

// Deliberately restrained -- per the build brief, this is the one section
// where design should stay out of the way of the owner's own words.
export function HostSection() {
  return (
    <section id="host" className="bg-warm-white px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
            From the host
          </p>
          <blockquote className="border-l-2 border-gold pl-6 font-display text-2xl italic leading-snug text-text-primary sm:text-3xl">
            &ldquo;{hostQuote.text}&rdquo;
          </blockquote>
          <p className="mt-5 pl-6 text-sm text-text-secondary">
            {hostQuote.source}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
