import { CinematicHero } from "@/components/CinematicHero";
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
import { getCinematicHero, getPublishedSightCards, getHeadlineSegments } from "@/lib/data/cinematic";
import { publicImageUrl } from "@/lib/storage";

export default async function Home() {
  const configured = isSupabaseConfigured();
  const supabase = configured ? await createClient() : null;
  const [galleryImages, cinematicHero, sightCards, headlineSegments] = supabase
    ? await Promise.all([
        getGalleryImages(supabase),
        getCinematicHero(supabase),
        getPublishedSightCards(supabase),
        getHeadlineSegments(supabase),
      ])
    : [[] as GalleryImage[], null, [], []];

  const mediaUrl = (path: string | null) =>
    path ? publicImageUrl("cinematic-media", path) : null;

  const heroContent = {
    skyImageUrl: mediaUrl(cinematicHero?.sky_image_path ?? null),
    skyVideoUrl: mediaUrl(cinematicHero?.sky_video_path ?? null),
    glowImageUrl: mediaUrl(cinematicHero?.glow_image_path ?? null),
    midgroundImageUrl: mediaUrl(cinematicHero?.midground_image_path ?? null),
    heroHeadline: cinematicHero?.hero_headline ?? null,
    introParagraph: cinematicHero?.intro_paragraph ?? null,
    heroTags: [
      cinematicHero?.hero_tag_1,
      cinematicHero?.hero_tag_2,
      cinematicHero?.hero_tag_3,
    ].filter((tag): tag is string => Boolean(tag)),
    splitframeLeftUrl: mediaUrl(cinematicHero?.splitframe_left_path ?? null),
    splitframeRightUrl: mediaUrl(cinematicHero?.splitframe_right_path ?? null),
    mainImageUrl: mediaUrl(cinematicHero?.main_image_path ?? null),
    mainVideoUrl: mediaUrl(cinematicHero?.main_video_path ?? null),
    closeupImageUrl: mediaUrl(cinematicHero?.closeup_image_path ?? null),
    panel1Heading: cinematicHero?.panel1_heading ?? null,
    panel1Paragraph: cinematicHero?.panel1_paragraph ?? null,
    panel1Facts: [
      { value: cinematicHero?.panel1_fact1_value, label: cinematicHero?.panel1_fact1_label },
      { value: cinematicHero?.panel1_fact2_value, label: cinematicHero?.panel1_fact2_label },
    ]
      .filter((fact) => fact.value || fact.label)
      .map((fact) => ({ value: fact.value ?? "", label: fact.label ?? "" })),
    panel2Heading: cinematicHero?.panel2_heading ?? null,
    panel2Paragraph: cinematicHero?.panel2_paragraph ?? null,
    panel2CtaLabel: cinematicHero?.panel2_cta_label ?? null,
  };

  const sightCardContent = sightCards.map((card) => ({
    id: card.id,
    kicker: card.kicker,
    title: card.title,
    description: card.description,
    pinIconUrl: mediaUrl(card.pin_icon_path),
  }));

  const headlineSegmentContent = headlineSegments.map((segment) => ({
    id: segment.id,
    text: segment.text,
    fontChoice: segment.font_choice,
    textCase: segment.text_case,
    color: segment.color,
    sizeMultiplier: segment.size_multiplier,
    offsetX: segment.offset_x,
    offsetY: segment.offset_y,
    layer: segment.layer,
  }));

  return (
    <>
      <SiteHeader showGallery={galleryImages.length > 0} />
      <CinematicHero
        hero={heroContent}
        sightCards={sightCardContent}
        headlineSegments={headlineSegmentContent}
        headlineThemeColor={cinematicHero?.headline_theme_color ?? null}
      />
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
