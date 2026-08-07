import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// True once the owner has created a Supabase project and set these on
// Netlify. Public pages check this before querying so the site falls back
// to placeholder copy instead of throwing when the backend isn't set up yet.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Server-side Supabase client for Server Components, Server Actions and
// Route Handlers. Reads the caller's session from cookies, so queries run
// as that user and are subject to the RLS policies in supabase/schema.sql.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render, where cookies can't be
            // written. proxy.ts refreshes the session cookie on navigation,
            // so this is safe to ignore.
          }
        },
      },
    }
  );
}

// Every admin page and Server Action calls this itself rather than relying
// on proxy.ts alone -- see the Next.js data-security guidance that render-time
// gating is not a security boundary.
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    throw new Error("Not authenticated");
  }
  return data.claims;
}
