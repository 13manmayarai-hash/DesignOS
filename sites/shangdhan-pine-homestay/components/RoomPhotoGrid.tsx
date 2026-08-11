"use client";

import Image from "next/image";
import { Lightbox } from "@/components/Lightbox";

type RoomPhoto = { id: string; src: string; alt: string };

// Client component for the same reason as GalleryGrid: keeps the
// open()-on-click closure entirely on the client side of the boundary.
export function RoomPhotoGrid({ photos }: { photos: RoomPhoto[] }) {
  return (
    <Lightbox images={photos.map((photo) => ({ src: photo.src, alt: photo.alt }))}>
      {(open) => (
        <div className="mb-6 grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => open(i)}
              aria-label={`View larger photo: ${photo.alt}`}
              className={`relative block overflow-hidden bg-sand-dark/20 ${
                i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 33vw, 45vw"
              />
            </button>
          ))}
        </div>
      )}
    </Lightbox>
  );
}
