"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type LightboxImage = { src: string; alt: string };

// Render-prop wrapper: the caller keeps full control of its own grid markup
// (aspect ratios, captions, stagger animation) and just calls `open(index)`
// from an onClick. This component only owns the fullscreen overlay state.
export function Lightbox({
  images,
  children,
}: {
  images: LightboxImage[];
  children: (open: (index: number) => void) => ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const open = useCallback((i: number) => {
    setLoaded(false);
    setIndex(i);
  }, []);
  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(() => {
    setLoaded(false);
    setIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);
  const prev = useCallback(() => {
    setLoaded(false);
    setIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, close, next, prev]);

  return (
    <>
      {children(open)}
      {index !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 px-14 sm:px-20"
          role="dialog"
          aria-modal="true"
          aria-label={images[index].alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-warm-white/10 text-2xl leading-none text-warm-white/80 transition-colors hover:bg-warm-white/20 hover:text-warm-white"
          >
            &times;
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-warm-white/10 text-2xl leading-none text-warm-white/70 transition-colors hover:bg-warm-white/20 hover:text-warm-white sm:left-6"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-warm-white/10 text-2xl leading-none text-warm-white/70 transition-colors hover:bg-warm-white/20 hover:text-warm-white sm:right-6"
              >
                &rarr;
              </button>
            </>
          ) : null}

          <div
            className="relative h-[75vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!loaded ? (
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-warm-white/25 border-t-warm-white/80" />
              </div>
            ) : null}
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              className={`object-contain transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="100vw"
              onLoad={() => setLoaded(true)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
