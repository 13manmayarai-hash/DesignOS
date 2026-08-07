export function SectionHeading({
  eyebrow,
  title,
  dark = false,
  center = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "text-center" : ""} ${className ?? ""}`}>
      {eyebrow ? (
        <p
          className={`mb-2 text-xs font-medium uppercase tracking-[0.14em] ${
            dark ? "text-gold-soft" : "text-gold-ink"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-display text-3xl leading-tight sm:text-4xl ${
          dark ? "text-warm-white" : "text-text-primary"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
