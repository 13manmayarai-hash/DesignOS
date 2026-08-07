"use client";

import { useEffect, useRef } from "react";

// Scroll-linked parallax on the two ridge layers, throttled to
// requestAnimationFrame. Skipped entirely under prefers-reduced-motion --
// the transform never updates, so the layers just sit static.
export function HeroScene() {
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (backRef.current) {
          backRef.current.style.transform = `translateY(${y * 0.12}px)`;
        }
        if (frontRef.current) {
          frontRef.current.style.transform = `translateY(${y * 0.05}px)`;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Stars -- only visible against the dark upper band of the gradient */}
      <svg
        className="absolute inset-x-0 top-0 h-2/3 w-full opacity-70"
        aria-hidden
      >
        <circle cx="8%" cy="12%" r="1.1" fill="#fbf7f1" opacity="0.8" />
        <circle cx="22%" cy="22%" r="0.9" fill="#fbf7f1" opacity="0.5" />
        <circle cx="14%" cy="34%" r="1.3" fill="#fbf7f1" opacity="0.6" />
        <circle cx="38%" cy="10%" r="1" fill="#fbf7f1" opacity="0.7" />
        <circle cx="61%" cy="16%" r="1.2" fill="#fbf7f1" opacity="0.5" />
        <circle cx="78%" cy="9%" r="0.9" fill="#fbf7f1" opacity="0.65" />
        <circle cx="88%" cy="24%" r="1.1" fill="#fbf7f1" opacity="0.55" />
        <circle cx="92%" cy="8%" r="0.8" fill="#fbf7f1" opacity="0.5" />
        <circle cx="48%" cy="6%" r="0.8" fill="#fbf7f1" opacity="0.6" />
        <circle cx="70%" cy="30%" r="1" fill="#fbf7f1" opacity="0.4" />
      </svg>

      <div ref={backRef} className="absolute inset-x-0 bottom-0 h-[45%] w-full">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 400 L0 260 L180 160 L340 240 L520 120 L680 220 L860 90 L1040 210 L1220 140 L1440 250 L1440 400 Z"
            fill="#241b2e"
            opacity="0.55"
          />
        </svg>
      </div>
      <div ref={frontRef} className="absolute inset-x-0 bottom-0 h-[45%] w-full">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 400 L0 320 L220 230 L420 300 L640 190 L820 290 L1020 180 L1220 280 L1440 210 L1440 400 Z"
            fill="#1a1420"
          />
        </svg>
      </div>
    </>
  );
}
