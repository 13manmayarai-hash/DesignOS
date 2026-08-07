import { SectionHeading } from "@/components/SectionHeading";
import { whatsappLink, property } from "@/lib/property-config";

const INQUIRY_MESSAGE = `Hi! I'd like to check availability at ${property.name}.`;

export function BookSection() {
  const link = whatsappLink(INQUIRY_MESSAGE);

  return (
    <section id="book" className="bg-charcoal px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading
          eyebrow="Book"
          title="Check availability over WhatsApp."
          dark
          center
        />
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-warm-white/75 sm:text-lg">
          No booking engine yet &mdash; just message the host directly and
          they&apos;ll confirm your dates.
        </p>
        <div className="mt-10">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 bg-gold px-9 py-4 text-xs font-medium uppercase tracking-[0.18em] text-charcoal transition-colors duration-[180ms] ease-out hover:bg-gold-soft"
            >
              Message on WhatsApp
              <span
                className="inline-block transition-transform duration-[180ms] ease-out group-hover:translate-x-1"
                aria-hidden
              >
                &rarr;
              </span>
            </a>
          ) : (
            <p className="text-sm text-warm-white/60">
              WhatsApp contact is being set up &mdash; check back soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
