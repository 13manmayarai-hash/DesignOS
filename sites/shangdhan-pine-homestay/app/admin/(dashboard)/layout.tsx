import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import { property } from "@/lib/property-config";
import { AdminNav } from "./_components/AdminNav";
import { SubmitButton } from "./_components/SubmitButton";

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

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* The binder-tab rail: a fixed masthead, the section tabs, then
          sign-out pinned to the bottom on desktop -- an index down the
          side of a ledger rather than a horizontal admin-template navbar. */}
      <aside className="border-b border-border-default bg-warm-white lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="px-5 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-ink">Ledger</p>
          <p className="font-display text-xl leading-tight text-text-primary">{property.name}</p>
          <p className="mt-1 font-mono text-[10px] text-text-secondary">{today}</p>
        </div>
        <div className="border-t border-border-default">
          <AdminNav />
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border-default px-5 py-4 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-2">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary"
          >
            View site &#8599;
          </Link>
          <form action={signOut}>
            <SubmitButton
              pendingLabel="Signing out..."
              className="border border-border-default px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-text-secondary hover:border-text-primary hover:text-text-primary lg:w-full"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-12">{children}</main>
    </div>
  );
}
