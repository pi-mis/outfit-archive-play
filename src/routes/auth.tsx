import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { SHOP } from "@/lib/catalog";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Accesso riservato · Baci & Bottoni" },
      { name: "description", content: "Area riservata alla gestione dell'archivio di Baci & Bottoni." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Accesso riservato · Baci & Bottoni" },
      { property: "og:description", content: "Area riservata alla gestione dell'archivio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setInfo("Controlla la mail per confermare l'account, poi accedi.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      await supabase.rpc("claim_admin");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore imprevisto";
      setError(
        message.includes("Invalid login")
          ? "Email o password non corretti."
          : message.includes("already registered")
            ? "Questo indirizzo è già registrato: accedi."
            : message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-center text-muted-foreground">Area riservata</p>
        <h1 className="mt-2 text-center font-serif text-4xl text-foreground">{SHOP.name}</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Gestione dell'archivio. Solo per lo staff del negozio.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="eyebrow text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-foreground/40"
            />
          </div>
          <div>
            <label htmlFor="password" className="eyebrow text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-foreground/40"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-[0.2em] text-background disabled:opacity-50"
          >
            {busy ? "Attendi…" : mode === "login" ? "Entra" : "Crea account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
          className="mt-6 w-full text-center text-xs uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4"
        >
          {mode === "login" ? "Primo accesso: crea l'account" : "Ho già un account"}
        </button>

        <a
          href="/"
          className="mt-8 block text-center text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          Torna al negozio
        </a>
      </div>
    </main>
  );
}
