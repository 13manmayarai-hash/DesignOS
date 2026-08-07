import { SectionHeading } from "@/components/SectionHeading";
import { whatsappLink, property } from "@/lib/property-config";

const INQUIRY_MESSAGE = `Hi! I'd like to check availability at ${property.name}.`;

export function BookSection() {
  const link = whatsappLink(INQUIRY_MESSAGE);

  return (
    <section id="book" className="bg-charcoal px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading
          eyebrow="Book"
          title="Check availability over WhatsApp."
          dark
          center
        />
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-warm-white/75">
          No booking engine yet -- just message the host directly and
          they&apos;ll confirm your dates.
        </p>
        <div className="mt-8">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-gold px-8 py-3 font-sans text-sm font-medium text-charcoal transition-colors duration-[180ms] ease-out hover:bg-gold-soft"
            >
              Message on WhatsApp
            </a>
          ) : (
            <p className="text-sm text-warm-white/60">
              WhatsApp contact is being set up -- check back soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
