"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { publicImageUrl } from "@/lib/storage";
import { SubmitButton } from "../../_components/SubmitButton";
import { Spinner } from "../../_components/Spinner";
import { NumberBadge, CheckIcon, XIcon } from "./Icons";
import { uploadCinematicMedia } from "./uploadCinematicMedia";
import type { MediaActionState } from "../actions";

const saveButtonClass =
  "bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-warm-white hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-70";
// Tailwind's file: variant styles the native "Choose File" pseudo-button
// (::file-selector-button) -- without it, that button is unstyled and the
// whole input looks like bare unstyled text with no visible control.
const fileInputClass =
  "block w-full max-w-xs text-xs text-text-secondary file:mr-3 file:cursor-pointer file:border file:border-border-default file:bg-warm-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:uppercase file:tracking-[0.08em] file:text-text-primary hover:file:bg-sand/50";

const initialState: MediaActionState = { error: null };

// Removal still goes through useActionState/<form> since it never sends a
// file body. The upload leg below deliberately doesn't: it uploads to
// Supabase Storage straight from the browser (see uploadCinematicMedia),
// then calls attachAction with just the resulting path, so a failure --
// bad storage bucket/RLS, an oversized file, a network blip -- shows
// inline instead of crashing the page.
export function MediaField({
  n,
  label,
  hint,
  currentPath,
  attachAction,
  removeAction,
  accept,
  isVideo = false,
}: {
  n: number;
  label: string;
  hint?: string;
  currentPath: string | null;
  attachAction: (path: string) => Promise<MediaActionState>;
  removeAction: (prevState: MediaActionState, formData: FormData) => Promise<MediaActionState>;
  accept: string;
  isVideo?: boolean;
}) {
  const url = currentPath ? publicImageUrl("cinematic-media", currentPath) : null;
  const [removeState, removeFormAction] = useActionState(removeAction, initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [isUploading, startUpload] = useTransition();

  function handleUpload() {
    if (!selectedFile) return;
    setUploadError(null);
    startUpload(async () => {
      try {
        const path = await uploadCinematicMedia(selectedFile);
        const result = await attachAction(path);
        if (result.error) {
          setUploadError(result.error);
          return;
        }
        setSelectedFile(null);
        setInputKey((k) => k + 1);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <div className="ledger-panel">
      <div className="flex items-center gap-2">
        <NumberBadge n={n} />
        <p className="text-sm font-medium text-text-primary">{label}</p>
      </div>
      {hint ? <p className="mt-1 text-xs text-text-secondary">{hint}</p> : null}

      {url ? (
        <div className="relative mt-3 inline-block">
          {isVideo ? (
            <video
              src={url}
              className="h-24 w-40 border border-border-default object-cover"
              muted
              playsInline
            />
          ) : (
            <Image
              src={url}
              alt=""
              width={160}
              height={96}
              className="h-24 w-40 border border-border-default object-cover"
            />
          )}
          <span
            title="Uploaded"
            aria-label="Uploaded"
            className="absolute -bottom-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-warm-white bg-forest text-warm-white shadow"
          >
            <CheckIcon />
          </span>
          <form action={removeFormAction} className="absolute -top-2 -right-2">
            <SubmitButton
              aria-label="Remove"
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-warm-white bg-stamp-red text-white shadow hover:opacity-90"
            >
              <XIcon />
            </SubmitButton>
          </form>
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border-default text-[9px]">
            !
          </span>
          Not uploaded yet.
        </p>
      )}
      {removeState.error ? (
        <p className="mt-2 text-xs font-medium text-stamp-red">{removeState.error}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <input
          key={inputKey}
          type="file"
          accept={accept}
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className={fileInputClass}
        />
        <button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading} className={saveButtonClass}>
          {isUploading ? (
            <span className="inline-flex items-center gap-1.5">
              <Spinner />
              Uploading...
            </span>
          ) : url ? (
            "Replace"
          ) : (
            "Upload"
          )}
        </button>
      </div>
      {uploadError ? <p className="mt-2 text-xs font-medium text-stamp-red">{uploadError}</p> : null}
    </div>
  );
}
