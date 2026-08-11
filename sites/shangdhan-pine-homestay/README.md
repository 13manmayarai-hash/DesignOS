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

## Backend setup (rooms, gallery, room photos, pricing)

The site has an admin panel at `/admin` for managing rooms (name, rent,
size, description, amenities, interior photos) and a general photo
gallery, backed by [Supabase](https://supabase.com) (Postgres + file
storage + auth). Until it's configured, the public site quietly falls
back to the placeholder copy in `lib/property-config.ts` -- nothing
breaks, the admin login page just shows a "not configured" notice.

To turn it on:

1. Create a free Supabase project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor -> New query**, paste the
   entire contents of `supabase/schema.sql`, and run it. This creates the
   `rooms`, `room_images` and `gallery_images` tables, row-level security
   policies, and the two storage buckets (`room-photos`, `gallery-photos`).
3. In **Project settings -> API**, copy the **Project URL** and the
   **anon public** key.
4. Set both as environment variables:
   - Locally: copy `.env.example` to `.env.local` and fill them in.
   - On your deploy host (e.g. Vercel: **Project -> Settings ->
     Environment Variables**), add `NEXT_PUBLIC_SUPABASE_URL` and
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then redeploy.
5. Create the owner's login: Supabase dashboard -> **Authentication ->
   Users -> Add user** (email + password, auto-confirm). Every logged-in
   account has full admin access, so only ever create this one login for
   the property owner -- don't share the password, and don't add other
   users unless they should also have full edit access.
6. Visit `/admin` on the deployed site (or `localhost:3000/admin`
   locally) and sign in.

From there, `/admin/rooms` manages room name, rent, size, description,
amenities and interior photos, and `/admin/gallery` manages the general
photo gallery shown on the homepage. Both take effect on the public site
immediately -- no rebuild needed, since the site now renders rooms and
gallery pages on the server per request rather than at build time.

## Booking (`/book`)

A direct-booking flow: guests pick rooms and activities, register ID
details (with FRRO/Form-C fields for foreign nationals), then pay the
host via UPI and confirm over WhatsApp. Room/activity pricing comes from
the same Supabase tables as `/admin`; bookings are recorded in `bookings`
/ `booking_items` / `booking_activities` / `booking_compliance` (see
`supabase/schema.sql`) so nothing is lost if the WhatsApp message doesn't
go through. Guests never log in -- row-level security lets anyone create
a booking but only the admin account can ever read one back.

Two things need to be set before this is fully live:

- `lib/property-config.ts`: `upiId` (the payment QR won't render without
  it -- the payment step shows a "message the host on WhatsApp instead"
  notice until then) and `isGstCompliant` (leave `false` unless the
  property has a GSTIN).
- `whatsappNumber` (see "Before launch" below) -- the final confirmation
  step needs it to open WhatsApp with the booking summary.

There's currently no admin UI for viewing submitted bookings or managing
`activities` -- they're in the database (viewable via Supabase's Table
Editor) but not yet surfaced in `/admin`.

### Guest confirmation emails

If a guest enters an email address, `/book` can send them a confirmation
automatically via [Resend](https://resend.com). Without it, everything
else still works exactly the same -- guests just won't get an email.

1. Create a free Resend account at [resend.com](https://resend.com).
2. **API Keys -> Create API Key**, copy it.
3. Set `RESEND_API_KEY` as an environment variable (same places as the
   Supabase keys above: `.env.local` locally, your host's environment
   variables for the deployed site).

That's it to start -- emails send from Resend's shared sandbox address
(`onboarding@resend.dev`), which works immediately with no domain setup,
though guests will see "via resend.dev" in some mail clients. To send
from your own address instead:

4. In Resend, **Domains -> Add Domain**, add the DNS records it gives you
   at your domain registrar, and wait for verification (usually
   minutes, occasionally longer).
5. Update `bookingEmailFrom` in `lib/property-config.ts` to an address on
   that domain, e.g. `"Shangdhan Pine Homestay <bookings@yourdomain.com>"`.

SMS and automated WhatsApp guest confirmations aren't built -- both need
their own separate paid services (an SMS gateway with DLT/TRAI sender
registration for India; the WhatsApp Business Cloud API with Meta
Business verification for WhatsApp) that are more involved to set up
than a straightforward addition to the codebase.

## Structure

- `lib/property-config.ts` -- facts still marked open in the brief
  (WhatsApp number, the noon check-in/out flag) plus the placeholder
  copy shown when no rooms exist in Supabase yet. Change these here,
  not in components.
- `lib/sunrise.ts` -- the sunrise-time and seasonal-window logic. Pure
  astronomical calculation, no external API.
- `app/globals.css` -- design tokens (color, type, motion) sourced from
  DesignOS Books 04--06.
- `lib/data/`, `lib/supabase/`, `supabase/schema.sql` -- the backend: data
  access functions, Supabase client setup, and the database schema. See
  "Backend setup" above.
- `app/admin/` -- the owner-facing admin panel (rooms + gallery
  management), gated by `proxy.ts` and Supabase Auth.
- `app/book/`, `lib/gst.ts`, `lib/dates.ts` -- the direct-booking flow and
  Indian hospitality GST tax math. See "Booking" above.
- `lib/email.ts` -- booking confirmation emails via Resend. See "Guest
  confirmation emails" above.

## Before launch

See "Open Items" in the build brief. In particular:

- Set a real WhatsApp number in `lib/property-config.ts`
  (`whatsappNumber`) -- the Book/Check-availability CTAs are inert until
  this is set.
- Follow "Backend setup" above, then add real rooms (name, rent, size,
  photos) through `/admin/rooms` -- the placeholder amenity list only
  shows while that table is empty.
- Confirm the noon check-in/check-out time with the property.
- Swap the illustrated hero for real clear-season photography once the
  archive is confirmed usable.
- Set `upiId` and `isGstCompliant` in `lib/property-config.ts` so `/book`
  can actually take a payment -- see "Booking" above.
