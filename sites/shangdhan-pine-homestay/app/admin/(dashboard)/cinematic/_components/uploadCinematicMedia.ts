import { createClient } from "@/lib/supabase/client";
import { randomStoragePath } from "@/lib/storage";

// Uploads straight from the browser to Supabase Storage instead of
// through a Server Action. Vercel Functions cap a request body at 4.5MB
// regardless of Next.js's own bodySizeLimit config, so any photo/video
// past that size silently failed when it was sent as FormData to the
// server. This never touches the Vercel function -- only the resulting
// storage path (a short string) goes there afterward, via
// attach*Action in actions.ts, to update the database row.
export async function uploadCinematicMedia(file: File): Promise<string> {
  const supabase = createClient();
  const path = randomStoragePath(file.name);
  const { error } = await supabase.storage
    .from("cinematic-media")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}
