"use client";

import Image from "next/image";
import { Lightbox } from "@/components/Lightbox";
import { Reveal } from "@/components/Reveal";

type GalleryGridImage = {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
};

// Client component: owns the grid markup + lightbox together so no
// function props ever need to cross the Server -> Client boundary (the
// parent Server Component only passes plain image data).
export function GalleryGrid({ images }: { images: GalleryGridImage[] }) {
  return (
    <Lightbox images={images.map((image) => ({ src: image.src, alt: image.alt }))}>
      {(open) => (
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {images.map((image, i) => (
            <Reveal key={image.id} delay={0.06 + (i % 6) * 0.06}>
              <button
                type="button"
                onClick={() => open(i)}
                aria-label={`View larger photo${image.caption ? `: ${image.caption}` : ""}`}
                className={`group relative block w-full overflow-hidden bg-sand-dark/20 ${
                  i % 5 === 0 ? "aspect-[4/5] sm:col-span-2 sm:row-span-2" : "aspect-square"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
                  sizes="(min-width: 640px) 33vw, 50vw"
                />
                {image.caption ? (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent px-4 py-3 text-left text-xs text-warm-white opacity-0 transition-opacity duration-[240ms] ease-out group-hover:opacity-100">
                    {image.caption}
                  </figcaption>
                ) : null}
              </button>
            </Reveal>
          ))}
        </div>
      )}
    </Lightbox>
  );
}
