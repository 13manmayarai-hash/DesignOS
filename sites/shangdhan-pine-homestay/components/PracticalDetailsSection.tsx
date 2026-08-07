import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { practicalDetails } from "@/lib/property-config";

export function PracticalDetailsSection() {
  return (
    <section id="practical" className="bg-surface px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading eyebrow="Practical details" title="Good to know before you arrive." />
        </Reveal>

        <Reveal delay={0.08} className="mt-10 divide-y divide-border-default rounded-2xl border border-border-default">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-text-secondary">Parking</span>
            <span className="text-sm font-medium text-text-primary">
              {practicalDetails.parking}
            </span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-text-secondary">Check-in</span>
            <span className="text-sm font-medium text-text-primary">
              {practicalDetails.checkIn}
            </span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-text-secondary">Check-out</span>
            <span className="text-sm font-medium text-text-primary">
              {practicalDetails.checkOut}
            </span>
          </div>
          {practicalDetails.airports.map((airport) => (
            <div key={airport.name} className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-text-secondary">{airport.note}</span>
              <span className="text-sm font-medium text-text-primary">
                {airport.name}, ~{airport.distanceKm} km
              </span>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-6 text-xs leading-relaxed text-text-secondary">
            {practicalDetails.checkInOutFlag}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
