export type Bucket = "room-photos" | "gallery-photos";

// Buckets are public-read (see supabase/schema.sql), so the URL is a plain
// string join -- no signed URL or client round-trip needed.
export function publicImageUrl(bucket: Bucket, storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export function randomStoragePath(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  const id = crypto.randomUUID();
  return `${id}.${ext}`;
}
