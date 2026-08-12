"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

// useFormStatus only reports the status of the nearest enclosing <form>,
// so this must render inside one -- it reads pending state from React
// itself rather than any spinner state we'd otherwise have to wire up
// by hand for every upload/save button.
export function SubmitButton({
  children,
  pendingLabel,
  className,
  disabled,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-label={ariaLabel}
      aria-busy={pending}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {pending ? (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
