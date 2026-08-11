// Single source of truth for facts that are still open items per the build
// brief. Keep every uncertain fact here as a one-line change, never buried
// in a component or layout.

export const property = {
  name: "Shangdhan Pine Homestay",
  location: "Lower Kaffer, Kalimpong district, West Bengal",
  aka: "Kaffer homestay",
};

// TODO(open item): real WhatsApp business number. Placeholder until the
// property confirms one -- do not ship with this value.
export const whatsappNumber = "";

export function whatsappLink(message: string): string | null {
  if (!whatsappNumber) return null;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// TODO(open item): real UPI VPA ("name@bank") for the /book payment step.
// Placeholder until the property confirms one -- the QR code and payment
// step won't render a working payment target until this is set.
export const upiId = "";
export const upiPayeeName = property.name;

// TODO(open item): confirm with the property whether they're GST-registered
// (have a GSTIN). Most homestays under the threshold are GST-exempt --
// leave false unless the owner confirms otherwise.
export const isGstCompliant = false;

// FLAG: noon check-in *and* check-out is unusual and unverified -- likely a
// listing error. Kept as a single config value so correcting it is a
// one-line change, not a layout change.
export const practicalDetails = {
  parking: "Free parking on-site",
  checkIn: "12:00 PM",
  checkOut: "12:00 PM",
  checkInOutFlag:
    "Same-time check-in/check-out is unverified and should be confirmed with the property before launch.",
  airports: [
    { name: "Pakyong", distanceKm: 21, note: "Nearest airport" },
    { name: "Bagdogra", distanceKm: 45, note: "Larger option" },
  ],
};

// Open item: room count, names and pricing are unconfirmed. Placeholder
// only -- do not present as real inventory.
export const rooms = {
  placeholder: true,
  note: "Room names, sizes and pricing to be confirmed with the property.",
  sharedAmenities: [
    "Private balcony facing the mountain",
    "Attached bathroom with hot water",
    "Wardrobe for longer stays",
    "Free WiFi in every room",
  ],
};

export const nearby = [
  {
    name: "Neora Valley",
    distanceKm: 25,
    description:
      "One of the last untouched forests in the eastern Himalayas. Red pandas and Himalayan black bear live in its slopes; birdwatchers come for the rest.",
  },
  {
    name: "Rishyap",
    distanceKm: 20,
    description:
      "A quiet hamlet known for its own view of the snow line and trails through forest that still feels unvisited.",
  },
  {
    name: "Lolegaon & Lava",
    distanceKm: null,
    description:
      "The nearest towns, each with their own monasteries and a slower pace than Kalimpong proper -- worth the detour on the way in or out.",
  },
];

// Provisional: built from listing facts, not the owner's own words. A
// single owner quote can replace this note without a rebuild.
export const nearbyProvisionalNote =
  "Awaiting a sentence from the owner in their own voice for this section.";

export const hostQuote = {
  text:
    "As an engineer by profession and a nature lover at heart, I've always believed in building not just structures, but experiences -- a space where comfort meets simplicity, and where guests can feel at home even when they're miles away from their own.",
  source: "From the owner's own listing bio",
};
