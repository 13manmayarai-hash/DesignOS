# Shangdhan Pine Homestay

Marketing site for Shangdhan Pine Homestay, Lower Kaffer, Kalimpong
district, West Bengal. Built against the build brief in
`shangdhan_pine_claude_code_prompt.md`, using DesignOS Books 00, 03--07,
10, 19--20 for tokens and structure.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `lib/property-config.ts` -- every fact still marked open in the brief
  (WhatsApp number, room pricing, the noon check-in/out flag). Change
  these here, not in components.
- `lib/sunrise.ts` -- the sunrise-time and seasonal-window logic. Pure
  astronomical calculation, no external API.
- `app/globals.css` -- design tokens (color, type, motion) sourced from
  DesignOS Books 04--06.

## Before launch

See "Open Items" in the build brief. In particular:

- Set a real WhatsApp number in `lib/property-config.ts`
  (`whatsappNumber`) -- the Book/Check-availability CTAs are inert until
  this is set.
- Confirm room names, sizes and pricing; replace the placeholder amenity
  list in the Rooms section.
- Confirm the noon check-in/check-out time with the property.
- Swap the illustrated hero for real clear-season photography once the
  archive is confirmed usable.
