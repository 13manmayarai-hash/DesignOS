import Image from "next/image";
import { Lightbox } from "@/components/Lightbox";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getPublishedRooms } from "@/lib/data/rooms";
import { publicImageUrl } from "@/lib/storage";
import { rooms as placeholderRooms } from "@/lib/property-config";

function formatRent(amount: number | null, unit: string) {
  if (amount === null) return null;
  return `${new Intl.NumberFormat("en-IN").format(amount)} ${unit}`;
}

export async function RoomsSection() {
  const rooms = isSupabaseConfigured()
    ? await getPublishedRooms(await createClient())
    : [];

  return (
    <section id="rooms" className="bg-surface px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="Rooms"
            title={
              <>
                Every room faces the <em className="italic">mountain</em>.
              </>
            }
          />
          <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary sm:text-lg">
            Each room opens onto a private balcony facing the mountain, with
            its own bathroom, hot water, and a wardrobe for longer stays.
          </p>
        </Reveal>

        {rooms.length > 0 ? (
          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            {rooms.map((room, i) => {
              const rent = formatRent(room.rent_amount, room.rent_unit);
              return (
                <Reveal key={room.id} delay={0.08 + i * 0.08}>
                  <div className="border-t-2 border-gold pt-6">
                    {room.room_images.length > 0 ? (
                      <Lightbox
                        images={room.room_images.map((image) => ({
                          src: publicImageUrl("room-photos", image.storage_path),
                          alt: image.alt_text ?? room.name,
                        }))}
                      >
                        {(open) => (
                          <div className="mb-6 grid grid-cols-3 gap-2">
                            {room.room_images.slice(0, 3).map((image, imgIndex) => (
                              <button
                                key={image.id}
                                type="button"
                                onClick={() => open(imgIndex)}
                                aria-label={`View larger photo of ${room.name}`}
                                className={`relative block overflow-hidden bg-sand-dark/20 ${
                                  imgIndex === 0
                                    ? "col-span-2 row-span-2 aspect-square"
                                    : "aspect-square"
                                }`}
                              >
                                <Image
                                  src={publicImageUrl("room-photos", image.storage_path)}
                                  alt={image.alt_text ?? room.name}
                                  fill
                                  className="object-cover"
                                  sizes="(min-width: 640px) 33vw, 45vw"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </Lightbox>
                    ) : null}
                    <span className="font-display text-sm italic text-gold-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-text-primary">
                      {room.name}
                    </h3>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
                      {[
                        rent ? `₹${rent}` : null,
                        room.size_sqft ? `${room.size_sqft} sq ft` : null,
                        room.max_guests ? `Sleeps ${room.max_guests}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {room.description ? (
                      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                        {room.description}
                      </p>
                    ) : null}
                    {room.amenities.length > 0 ? (
                      <ul className="mt-4 space-y-1.5">
                        {room.amenities.map((amenity) => (
                          <li key={amenity} className="text-sm text-text-primary">
                            {amenity}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="mt-14">
            <div className="divide-y divide-border-default border-y border-border-default">
              {placeholderRooms.sharedAmenities.map((amenity, i) => (
                <Reveal key={amenity} delay={0.08 + i * 0.08}>
                  <div className="flex items-baseline gap-5 py-5 sm:gap-6">
                    <span className="font-display text-sm italic text-gold-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-text-primary sm:text-base">
                      {amenity}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.08 + placeholderRooms.sharedAmenities.length * 0.08}>
              <div className="mt-8 border border-dashed border-sand-dark bg-warm-white/60 px-5 py-4 text-sm text-text-secondary">
                {placeholderRooms.note}
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
