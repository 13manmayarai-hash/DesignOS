import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client, used from Client Components (the login
// form). Safe to expose -- the anon key only grants what the RLS policies
// in supabase/schema.sql allow.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
