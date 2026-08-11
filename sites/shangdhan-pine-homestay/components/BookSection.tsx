import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { whatsappLink, property } from "@/lib/property-config";

const INQUIRY_MESSAGE = `Hi! I'd like to check availability at ${property.name}.`;

export function BookSection() {
  const link = whatsappLink(INQUIRY_MESSAGE);

  return (
    <section id="book" className="bg-charcoal px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading eyebrow="Book" title="Reserve your stay." dark center />
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-warm-white/75 sm:text-lg">
          Pick your dates and rooms, pay the host directly by UPI, and we&apos;ll confirm over
          WhatsApp.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/book"
            className="group inline-flex items-center justify-center gap-2 bg-gold px-9 py-4 text-xs font-medium uppercase tracking-[0.18em] text-charcoal transition-colors duration-[180ms] ease-out hover:bg-gold-soft"
          >
            Book your stay
            <span
              className="inline-block transition-transform duration-[180ms] ease-out group-hover:translate-x-1"
              aria-hidden
            >
              &rarr;
            </span>
          </Link>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium uppercase tracking-[0.14em] text-warm-white/60 underline-offset-4 hover:text-warm-white hover:underline"
            >
              or message the host on WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
