import { GalleryGrid } from "@/components/GalleryGrid";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { publicImageUrl } from "@/lib/storage";
import type { GalleryImage } from "@/lib/data/gallery";

export function GallerySection({ images }: { images: GalleryImage[] }) {
  const gridImages = images.map((image) => ({
    id: image.id,
    src: publicImageUrl("gallery-photos", image.storage_path),
    alt: image.caption ?? "Shangdhan Pine Homestay",
    caption: image.caption,
  }));

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

        <GalleryGrid images={gridImages} />
      </div>
    </section>
  );
}
