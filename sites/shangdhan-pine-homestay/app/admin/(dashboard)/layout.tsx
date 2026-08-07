import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireUser();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border-default bg-warm-white px-6 py-4 sm:px-10">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg text-text-primary">Admin</span>
          <nav className="flex gap-6 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
            <Link href="/admin/rooms" className="hover:text-text-primary">
              Rooms
            </Link>
            <Link href="/admin/gallery" className="hover:text-text-primary">
              Gallery
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-medium uppercase tracking-[0.14em] text-text-secondary hover:text-text-primary"
          >
            View site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="border border-border-default px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary hover:border-text-primary hover:text-text-primary"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">{children}</main>
    </div>
  );
}
