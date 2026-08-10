import type { NextConfig } from "next";

// Static export was dropped in favor of SSR so the site can read live data
// from Supabase instead of only at build time.
//
// A malformed NEXT_PUBLIC_SUPABASE_URL (e.g. just the project ref instead of
// the full https://...supabase.co URL) must not crash the whole build --
// next/image config is a nice-to-have, not load-bearing. Fall back to no
// remote patterns and let isSupabaseConfigured() / the data layer surface
// the real problem instead.
function getSupabaseHostname(): string | undefined {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return undefined;
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    console.warn(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL ("${supabaseUrl}") -- expected something like https://xxxxx.supabase.co. Room and gallery photos won't load until this is fixed.`
    );
    return undefined;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  // Default Server Action body limit is 1MB; photo uploads need more room.
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
