import Link from "next/link";

// Full-bleed stylized sunrise, built as layered gradients + an SVG ridge
// silhouette rather than a stand-in photo -- the archive's clear-season
// images aren't confirmed yet (see build brief, Open Items #5), and an
// honest illustration beats a fabricated "real" photo.
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] w-full items-end overflow-hidden bg-charcoal">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 100%, #f6d488 0%, #e3a94f 22%, #c9793f 42%, #6b4a5a 62%, #2b2138 82%, #171326 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "radial-gradient(60% 140% at 50% 100%, rgba(255,215,140,0.55) 0%, rgba(255,215,140,0) 70%)",
        }}
        aria-hidden
      />
      <svg
        className="absolute inset-x-0 bottom-0 h-[45%] w-full"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 400 L0 260 L180 160 L340 240 L520 120 L680 220 L860 90 L1040 210 L1220 140 L1440 250 L1440 400 Z"
          fill="#241b2e"
          opacity="0.55"
        />
        <path
          d="M0 400 L0 320 L220 230 L420 300 L640 190 L820 290 L1020 180 L1220 280 L1440 210 L1440 400 Z"
          fill="#1a1420"
        />
      </svg>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16 pt-40 sm:px-10 sm:pb-24">
        <h1 className="max-w-2xl font-display text-4xl leading-[1.1] text-warm-white sm:text-6xl">
          Wake to Kanchenjunga turning to molten gold.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-warm-white/85 sm:text-lg">
          Best seen February through March, from a homestay in Lower Kaffer
          built by an engineer who traded structures for mornings like this
          one.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href="#rooms"
            className="rounded-full bg-gold px-7 py-3 font-sans text-sm font-medium text-charcoal transition-colors duration-[180ms] ease-out hover:bg-gold-soft"
          >
            See the Rooms
          </Link>
          <Link
            href="#book"
            className="rounded-full border border-warm-white/40 px-7 py-3 font-sans text-sm font-medium text-warm-white transition-colors duration-[180ms] ease-out hover:bg-warm-white/10"
          >
            Check Availability
          </Link>
        </div>
      </div>
    </section>
  );
}
