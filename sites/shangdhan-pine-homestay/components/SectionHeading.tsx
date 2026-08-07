import type { ReactNode } from "react";

export function SectionHeading({
  index,
  eyebrow,
  title,
  dark = false,
  center = false,
  className,
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "text-center" : ""} ${className ?? ""}`}>
      {eyebrow ? (
        <div
          className={`mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] ${
            center ? "justify-center" : ""
          } ${dark ? "text-gold-soft" : "text-gold-ink"}`}
        >
          {index ? (
            <>
              <span className="font-display text-sm italic tracking-normal">
                {index}
              </span>
              <span
                className={`h-px w-8 ${dark ? "bg-gold-soft/40" : "bg-gold-ink/30"}`}
                aria-hidden
              />
            </>
          ) : null}
          <span>{eyebrow}</span>
        </div>
      ) : null}
      <h2
        className={`font-display text-4xl leading-[1.08] tracking-[-0.01em] sm:text-5xl ${
          dark ? "text-warm-white" : "text-text-primary"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
