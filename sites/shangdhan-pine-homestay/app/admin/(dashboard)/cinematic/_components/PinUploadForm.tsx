"use client";

import { useActionState } from "react";
import { SubmitButton } from "../../_components/SubmitButton";
import type { MediaActionState } from "../actions";

const fileInputClass =
  "block w-full max-w-xs text-xs text-text-secondary file:mr-3 file:cursor-pointer file:border file:border-border-default file:bg-warm-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:uppercase file:tracking-[0.08em] file:text-text-primary hover:file:bg-sand/50";

const initialState: MediaActionState = { error: null };

// Same useActionState pattern as MediaField -- a failed pin upload shows
// inline instead of crashing the page.
export function PinUploadForm({
  action,
  hasExisting,
}: {
  action: (prevState: MediaActionState, formData: FormData) => Promise<MediaActionState>;
  hasExisting: boolean;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="file" name="pin" accept="image/*" required className={fileInputClass} />
        <SubmitButton
          pendingLabel="Uploading..."
          className="text-xs font-medium text-gold-ink hover:text-text-primary"
        >
          {hasExisting ? "Replace icon" : "Upload icon"}
        </SubmitButton>
      </form>
      {state.error ? <p className="text-xs font-medium text-stamp-red">{state.error}</p> : null}
    </div>
  );
}
