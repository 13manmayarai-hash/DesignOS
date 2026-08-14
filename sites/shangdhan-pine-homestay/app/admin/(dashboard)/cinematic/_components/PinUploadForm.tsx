"use client";

import { useState, useTransition } from "react";
import { uploadCinematicMedia } from "./uploadCinematicMedia";
import type { MediaActionState } from "../actions";

const fileInputClass =
  "block w-full max-w-xs text-xs text-text-secondary file:mr-3 file:cursor-pointer file:border file:border-border-default file:bg-warm-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:uppercase file:tracking-[0.08em] file:text-text-primary hover:file:bg-sand/50";

// Same reasoning as MediaField: the file uploads straight from the
// browser to Supabase Storage, and only the resulting path is sent to
// attachAction -- a Vercel Function request body caps at 4.5MB, which a
// FormData-carried file could easily exceed.
export function PinUploadForm({
  action,
  hasExisting,
}: {
  action: (path: string) => Promise<MediaActionState>;
  hasExisting: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [isUploading, startUpload] = useTransition();

  function handleUpload() {
    if (!selectedFile) return;
    setError(null);
    startUpload(async () => {
      try {
        const path = await uploadCinematicMedia(selectedFile);
        const result = await action(path);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSelectedFile(null);
        setInputKey((k) => k + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <input
          key={inputKey}
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className={fileInputClass}
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="text-xs font-medium text-gold-ink hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : hasExisting ? "Replace icon" : "Upload icon"}
        </button>
      </div>
      {error ? <p className="text-xs font-medium text-stamp-red">{error}</p> : null}
    </div>
  );
}
