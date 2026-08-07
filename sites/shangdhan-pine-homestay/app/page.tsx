import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";
import { SunriseSection } from "@/components/SunriseSection";
import { RoomsSection } from "@/components/RoomsSection";
import { HostSection } from "@/components/HostSection";
import { GardenSection } from "@/components/GardenSection";
import { NearbySection } from "@/components/NearbySection";
import { PracticalDetailsSection } from "@/components/PracticalDetailsSection";
import { BookSection } from "@/components/BookSection";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyBookingBar } from "@/components/StickyBookingBar";

export default function Home() {
  return (
    <>
      <div className="relative">
        <SiteHeader />
        <Hero />
      </div>
      <main className="flex-1 pb-16 sm:pb-0">
        <SunriseSection />
        <RoomsSection />
        <HostSection />
        <GardenSection />
        <NearbySection />
        <PracticalDetailsSection />
        <BookSection />
      </main>
      <SiteFooter />
      <StickyBookingBar />
    </>
  );
}
