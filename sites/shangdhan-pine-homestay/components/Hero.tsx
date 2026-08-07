import { Button } from "@/components/Button";
import { HeroScene } from "@/components/HeroScene";

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
        className="absolute inset-x-0 bottom-0 h-1/2 animate-[hero-glow_10s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(60% 140% at 50% 100%, rgba(255,215,140,0.55) 0%, rgba(255,215,140,0) 70%)",
        }}
        aria-hidden
      />
      {/* Top vignette keeps the nav legible over the brightest part of the gradient */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,12,20,0.35) 0%, rgba(15,12,20,0) 100%)",
        }}
        aria-hidden
      />
      <HeroScene />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-40 sm:px-10 sm:pb-28">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-gold-soft">
          Lower Kaffer &middot; Kalimpong District
        </p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.04] tracking-[-0.01em] text-warm-white sm:text-7xl">
          Wake to Kanchenjunga turning to <em className="italic">molten gold</em>.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-warm-white/80 sm:text-lg">
          Best seen February through March, from a homestay built by an
          engineer who traded structures for mornings like this one.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="#rooms" variant="primary">
            See the Rooms
          </Button>
          <Button href="#book" variant="outlineDark">
            Check Availability
          </Button>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-6 z-10 hidden justify-center sm:flex"
        aria-hidden
      >
        <div className="flex flex-col items-center gap-2 text-warm-white/50">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em]">
            Scroll
          </span>
          <span className="h-8 w-px bg-gradient-to-b from-warm-white/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}
