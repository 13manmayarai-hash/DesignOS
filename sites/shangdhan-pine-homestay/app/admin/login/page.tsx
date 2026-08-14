"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { property } from "@/lib/property-config";
import { Spinner } from "../(dashboard)/_components/Spinner";

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-2xl text-text-primary">Backend not set up yet</h1>
          <p className="mt-3 text-sm text-text-secondary">
            Create a Supabase project, run <code>supabase/schema.sql</code>, and
            set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Netlify to enable the
            admin panel. See the README for the full setup guide.
          </p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace("/admin/rooms");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-gold-ink">
          Ledger
        </p>
        <p className="font-display text-2xl leading-tight text-text-primary">{property.name}</p>
        <div className="ledger-panel mt-6">
          <h1 className="font-display text-2xl text-text-primary">Admin sign in</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-border-default bg-warm-white px-4 py-3 text-sm text-text-primary outline-none focus:border-gold-ink"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-border-default bg-warm-white px-4 py-3 text-sm text-text-primary outline-none focus:border-gold-ink"
              />
            </div>
            {error ? <p className="text-sm text-stamp-red">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal px-6 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-warm-white transition-colors duration-150 ease-out hover:bg-charcoal/90 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Spinner />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
