import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getGalleryImages } from "@/lib/data/gallery";
import { publicImageUrl } from "@/lib/storage";
import {
  deleteGalleryImageAction,
  moveGalleryImageAction,
  updateGalleryImageAction,
  uploadGalleryImageAction,
} from "./actions";

const inputClass =
  "mt-1.5 w-full border border-border-default bg-warm-white px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-ink";
const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const images = await getGalleryImages(supabase);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-text-primary">Gallery</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Photos shown in the site&apos;s gallery section -- exteriors, garden,
          views, food, anything beyond individual rooms.
        </p>
      </div>

      <section className="border border-border-default bg-warm-white p-6">
        <h2 className="font-display text-xl text-text-primary">Add a photo</h2>
        <form
          action={uploadGalleryImageAction}
          className="mt-5 flex flex-wrap items-end gap-4"
        >
          <div>
            <label className={labelClass}>Photo</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              required
              className="mt-1.5 text-sm text-text-secondary"
            />
          </div>
          <div>
            <label className={labelClass}>Caption (optional)</label>
            <input name="caption" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category (optional)</label>
            <input name="category" placeholder="e.g. garden, views" className={inputClass} />
          </div>
          <button
            type="submit"
            className="bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-warm-white hover:bg-charcoal/90"
          >
            Upload
          </button>
        </form>
      </section>

      <section>
        {images.length === 0 ? (
          <p className="text-sm text-text-secondary">No photos yet -- add the first one above.</p>
        ) : null}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {images.map((image, i) => (
            <div key={image.id} className="border border-border-default bg-warm-white p-3">
              <div className="relative aspect-[4/3] overflow-hidden bg-sand-dark/20">
                <Image
                  src={publicImageUrl("gallery-photos", image.storage_path)}
                  alt={image.caption ?? "Property photo"}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
              </div>
              <form action={updateGalleryImageAction.bind(null, image.id)} className="mt-3 space-y-2">
                <input
                  name="caption"
                  placeholder="Caption"
                  defaultValue={image.caption ?? ""}
                  className={inputClass}
                />
                <input
                  name="category"
                  placeholder="Category"
                  defaultValue={image.category ?? ""}
                  className={inputClass}
                />
                <button
                  type="submit"
                  className="w-full border border-charcoal px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-charcoal hover:bg-charcoal hover:text-warm-white"
                >
                  Save
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                <form action={moveGalleryImageAction.bind(null, image.id, "up")}>
                  <button type="submit" disabled={i === 0} className="disabled:opacity-30">
                    &uarr; Move up
                  </button>
                </form>
                <form action={moveGalleryImageAction.bind(null, image.id, "down")}>
                  <button
                    type="submit"
                    disabled={i === images.length - 1}
                    className="disabled:opacity-30"
                  >
                    Move down &darr;
                  </button>
                </form>
              </div>
              <form action={deleteGalleryImageAction.bind(null, image.id)} className="mt-2">
                <button type="submit" className="text-xs font-medium text-red-700 hover:underline">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
