export type Bucket = "room-photos" | "gallery-photos" | "payment-qr";

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

// guest-documents is private (see supabase/schema.sql), unlike the photo
// buckets above -- there's no public URL to construct. Only an authenticated
// (admin) Supabase client can successfully create a signed URL here; RLS on
// storage.objects rejects the call otherwise. Short expiry since this is
// personal ID data.
export async function createSignedGuestDocumentUrl(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  storagePath: string,
  expiresInSeconds = 300
) {
  const { data, error } = await supabase.storage
    .from("guest-documents")
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
