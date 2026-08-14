import { Spinner } from "./Spinner";

// Rendered by every route segment's loading.tsx -- Next.js swaps this in
// immediately on navigation (AdminNav tab click, back/forward, direct
// link) while that page's Server Component data fetch is in flight, so a
// tab click always gives instant feedback instead of an unexplained pause.
export function AdminPageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
        <Spinner className="h-5 w-5" />
        Loading...
      </div>
    </div>
  );
}
