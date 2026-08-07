import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";
import { SunriseSection } from "@/components/SunriseSection";
import { RoomsSection } from "@/components/RoomsSection";
import { HostSection } from "@/components/HostSection";
import { GardenSection } from "@/components/GardenSection";
import { GallerySection } from "@/components/GallerySection";
import { NearbySection } from "@/components/NearbySection";
import { PracticalDetailsSection } from "@/components/PracticalDetailsSection";
import { BookSection } from "@/components/BookSection";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyBookingBar } from "@/components/StickyBookingBar";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getGalleryImages, type GalleryImage } from "@/lib/data/gallery";

export default async function Home() {
  const galleryImages: GalleryImage[] = isSupabaseConfigured()
    ? await getGalleryImages(await createClient())
    : [];

  return (
    <>
      <SiteHeader showGallery={galleryImages.length > 0} />
      <Hero />
      <main className="flex-1 pb-16 sm:pb-0">
        <SunriseSection />
        <RoomsSection />
        <HostSection />
        <GardenSection />
        {galleryImages.length > 0 ? <GallerySection images={galleryImages} /> : null}
        <NearbySection />
        <PracticalDetailsSection />
        <BookSection />
      </main>
      <SiteFooter />
      <StickyBookingBar />
    </>
  );
}
