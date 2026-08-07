import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { publicImageUrl } from "@/lib/storage";
import type { GalleryImage } from "@/lib/data/gallery";

export function GallerySection({ images }: { images: GalleryImage[] }) {
  return (
    <section id="gallery" className="bg-background px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="Gallery"
            title={
              <>
                A closer <em className="italic">look</em>.
              </>
            }
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {images.map((image, i) => (
            <Reveal key={image.id} delay={0.06 + (i % 6) * 0.06}>
              <figure
                className={`group relative overflow-hidden bg-sand-dark/20 ${
                  i % 5 === 0 ? "aspect-[4/5] sm:col-span-2 sm:row-span-2" : "aspect-square"
                }`}
              >
                <Image
                  src={publicImageUrl("gallery-photos", image.storage_path)}
                  alt={image.caption ?? "Shangdhan Pine Homestay"}
                  fill
                  className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
                  sizes="(min-width: 640px) 33vw, 50vw"
                />
                {image.caption ? (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent px-4 py-3 text-xs text-warm-white opacity-0 transition-opacity duration-[240ms] ease-out group-hover:opacity-100">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
