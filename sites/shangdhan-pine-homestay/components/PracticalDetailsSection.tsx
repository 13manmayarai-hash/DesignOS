import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { practicalDetails } from "@/lib/property-config";

export function PracticalDetailsSection() {
  const specs = [
    { label: "Parking", value: practicalDetails.parking },
    { label: "Check-in", value: practicalDetails.checkIn },
    { label: "Check-out", value: practicalDetails.checkOut },
    ...practicalDetails.airports.map((airport) => ({
      label: airport.note,
      value: `${airport.name}, ~${airport.distanceKm} km`,
    })),
  ];

  return (
    <section id="practical" className="bg-surface px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            index="05"
            eyebrow="Practical details"
            title="Good to know before you arrive."
          />
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {specs.map((spec, i) => (
            <Reveal key={spec.label} delay={0.08 + i * 0.08}>
              <div className="border-t border-border-default pt-5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
                  {spec.label}
                </p>
                <p className="mt-2 font-display text-2xl text-text-primary">
                  {spec.value}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12 + specs.length * 0.08}>
          <p className="mt-10 text-xs leading-relaxed text-text-secondary">
            {practicalDetails.checkInOutFlag}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
