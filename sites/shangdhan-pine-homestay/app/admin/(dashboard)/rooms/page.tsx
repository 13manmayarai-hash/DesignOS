import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getAllRooms } from "@/lib/data/rooms";
import { getAllBlockedRanges } from "@/lib/data/blocked-dates";
import { publicImageUrl } from "@/lib/storage";
import { SubmitButton } from "../_components/SubmitButton";
import { StampBadge } from "../_components/StampBadge";
import {
  createRoomAction,
  deleteRoomAction,
  deleteRoomImageAction,
  moveRoomImageAction,
  updateRoomAction,
  uploadRoomImageAction,
  createBlockedRangeAction,
  deleteBlockedRangeAction,
} from "./actions";

const inputClass =
  "mt-1.5 w-full border border-border-default bg-warm-white px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-ink";
const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  const [rooms, allBlockedRanges] = await Promise.all([
    getAllRooms(supabase),
    getAllBlockedRanges(supabase),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-3xl text-text-primary">Rooms</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Room name, rent, size and photos shown on the public site. Unpublished
          rooms are saved but hidden from visitors.
        </p>
      </div>

      <section className="ledger-panel">
        <h2 className="font-display text-xl text-text-primary">Add a room</h2>
        <form action={createRoomAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <RoomFields />
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-warm-white hover:bg-charcoal/90"
            >
              Add room
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-8">
        {rooms.length === 0 ? (
          <p className="text-sm text-text-secondary">No rooms yet -- add the first one above.</p>
        ) : null}
        {rooms.map((room) => (
          <div key={room.id} className="ledger-panel">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-xl text-text-primary">{room.name}</h3>
                <StampBadge tone={room.published ? "confirmed" : "muted"}>
                  {room.published ? "Published" : "Hidden"}
                </StampBadge>
              </div>
              <form action={deleteRoomAction.bind(null, room.id)}>
                <button
                  type="submit"
                  className="text-xs font-medium uppercase tracking-[0.1em] text-stamp-red hover:underline"
                >
                  Delete room
                </button>
              </form>
            </div>

            <form
              action={updateRoomAction.bind(null, room.id)}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <RoomFields room={room} />
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="border border-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-charcoal hover:bg-charcoal hover:text-warm-white"
                >
                  Save changes
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-border-default pt-6">
              <h4 className={labelClass}>Interior photos</h4>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {room.room_images.map((image, i) => (
                  <div key={image.id} className="space-y-2">
                    <div className="relative aspect-square overflow-hidden border border-border-default bg-sand-dark/20">
                      <Image
                        src={publicImageUrl("room-photos", image.storage_path)}
                        alt={image.alt_text ?? room.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1 text-xs text-text-secondary">
                      <form action={moveRoomImageAction.bind(null, room.id, image.id, "up")}>
                        <button type="submit" disabled={i === 0} className="disabled:opacity-30">
                          &uarr;
                        </button>
                      </form>
                      <form action={moveRoomImageAction.bind(null, room.id, image.id, "down")}>
                        <button
                          type="submit"
                          disabled={i === room.room_images.length - 1}
                          className="disabled:opacity-30"
                        >
                          &darr;
                        </button>
                      </form>
                      <form action={deleteRoomImageAction.bind(null, image.id)}>
                        <button type="submit" className="text-stamp-red hover:underline">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <form
                action={uploadRoomImageAction.bind(null, room.id)}
                className="mt-5 flex flex-wrap items-end gap-3"
              >
                <div>
                  <label className={labelClass}>Add photo</label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    required
                    className="mt-1.5 text-sm text-text-secondary"
                  />
                </div>
                <div>
                  <label className={labelClass}>Alt text (optional)</label>
                  <input name="alt_text" className={inputClass} />
                </div>
                <button
                  type="submit"
                  className="border border-charcoal px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-charcoal hover:bg-charcoal hover:text-warm-white"
                >
                  Upload
                </button>
              </form>
            </div>

            <div className="mt-8 border-t border-border-default pt-6">
              <h4 className={labelClass}>Blocked dates</h4>
              <p className="mt-1 text-xs text-text-secondary">
                Take this room off the market for a stretch of time -- maintenance, personal
                use, anything not tied to a guest booking. Guests can&apos;t book over a blocked
                range.
              </p>

              {(() => {
                const roomBlockedRanges = allBlockedRanges.filter((r) => r.room_id === room.id);
                return roomBlockedRanges.length === 0 ? (
                  <p className="mt-3 text-sm text-text-secondary">No blocked dates for this room.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {roomBlockedRanges.map((range) => (
                      <li
                        key={range.id}
                        className="flex items-center justify-between gap-3 border-b border-border-default py-2 text-sm"
                      >
                        <span className="font-mono text-xs text-text-primary">
                          {range.start_date} &rarr; {range.end_date}
                          {range.reason ? (
                            <span className="text-text-secondary"> -- {range.reason}</span>
                          ) : null}
                        </span>
                        <form action={deleteBlockedRangeAction.bind(null, range.id)}>
                          <SubmitButton
                            pendingLabel="Removing..."
                            className="text-xs font-medium text-stamp-red hover:underline"
                          >
                            Remove
                          </SubmitButton>
                        </form>
                      </li>
                    ))}
                  </ul>
                );
              })()}

              <form
                action={createBlockedRangeAction.bind(null, room.id)}
                className="mt-4 flex flex-wrap items-end gap-3"
              >
                <div>
                  <label className={labelClass}>Start date</label>
                  <input type="date" name="startDate" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End date</label>
                  <input type="date" name="endDate" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Reason (optional)</label>
                  <input name="reason" placeholder="e.g. Maintenance" className={inputClass} />
                </div>
                <SubmitButton
                  pendingLabel="Blocking..."
                  className="border border-charcoal px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-charcoal hover:bg-charcoal hover:text-warm-white"
                >
                  Block dates
                </SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function RoomFields({
  room,
}: {
  room?: {
    name: string;
    rent_amount: number | null;
    rent_unit: string;
    size_sqft: number | null;
    max_guests: number | null;
    description: string | null;
    amenities: string[];
    published: boolean;
  };
}) {
  return (
    <>
      <div>
        <label className={labelClass}>Room name</label>
        <input name="name" required defaultValue={room?.name} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Max guests</label>
        <input
          name="max_guests"
          type="number"
          min={1}
          defaultValue={room?.max_guests ?? undefined}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Rent amount (INR)</label>
        <input
          name="rent_amount"
          type="number"
          min={0}
          step="1"
          defaultValue={room?.rent_amount ?? undefined}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Rent unit</label>
        <input
          name="rent_unit"
          defaultValue={room?.rent_unit ?? "per night"}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Size (sq ft)</label>
        <input
          name="size_sqft"
          type="number"
          min={0}
          defaultValue={room?.size_sqft ?? undefined}
          className={inputClass}
        />
      </div>
      <div className="flex items-end pb-2">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-text-secondary">
          <input
            type="checkbox"
            name="published"
            defaultChecked={room ? room.published : true}
          />
          Published (visible on site)
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={room?.description ?? ""}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Amenities (one per line)</label>
        <textarea
          name="amenities"
          rows={4}
          defaultValue={room?.amenities.join("\n") ?? ""}
          className={inputClass}
        />
      </div>
    </>
  );
}
