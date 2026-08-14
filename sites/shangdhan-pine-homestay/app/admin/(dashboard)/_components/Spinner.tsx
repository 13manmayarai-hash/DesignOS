// The one spinner glyph for the whole admin -- every pending button and
// every route's loading.tsx renders this, so "something is happening"
// looks the same everywhere instead of varying by which component
// happened to implement its own pending state.
export function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}
