import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getPublishedRooms } from "@/lib/data/rooms";
import { getPublishedActivities } from "@/lib/data/activities";
import { getGalleryImages } from "@/lib/data/gallery";
import { getSettings } from "@/lib/data/settings";
import { publicImageUrl } from "@/lib/storage";
import { BookingFlow } from "./components/BookingFlow";

export const metadata: Metadata = {
  title: "Book -- Shangdhan Pine Homestay",
};

export default async function BookPage() {
  const configured = isSupabaseConfigured();
  const supabase = configured ? await createClient() : null;
  const [rooms, activities, galleryImages, settings] = supabase
    ? await Promise.all([
        getPublishedRooms(supabase),
        getPublishedActivities(supabase),
        getGalleryImages(supabase),
        getSettings(supabase),
      ])
    : [[], [], [], null];

  const paymentQrUrl = settings?.payment_qr_storage_path
    ? publicImageUrl("payment-qr", settings.payment_qr_storage_path)
    : null;

  return (
    <>
      <SiteHeader showGallery={galleryImages.length > 0} />
      <main className="flex-1 bg-background pt-24">
        <div className="mx-auto max-w-6xl px-6 pt-12 sm:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold-ink">Book direct</p>
          <h1 className="mt-3 font-display text-4xl text-text-primary sm:text-5xl">
            Reserve your stay.
          </h1>
        </div>
        {configured ? (
          <BookingFlow
            rooms={rooms}
            activities={activities}
            gstApplicable={settings?.gst_applicable ?? false}
            paymentQrUrl={paymentQrUrl}
          />
        ) : (
          <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:px-10">
            <p className="text-sm text-text-secondary">
              Online booking isn&apos;t set up yet -- please use the WhatsApp/call details on the
              homepage to reach the property directly.
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
