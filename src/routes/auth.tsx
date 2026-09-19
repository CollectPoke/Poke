import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { WelcomeTrainer } from "@/components/WelcomeTrainer";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Poke" },
      { name: "description", content: "Sign in to mint, buy and sell one-of-one Poke cards." },
      { property: "og:title", content: "Sign in · Poke" },
      {
        property: "og:description",
        content: "Sign in to mint, buy and sell one-of-one Poke cards.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">You're signed in</h1>
        <Link to="/account" className="poke-btn mt-6 inline-flex">
          Go to my binder
        </Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username.trim() },
          },
        });
        if (err) throw err;
        if (!data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
        } else {
          navigate({ to: "/account" });
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        navigate({ to: "/account" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/account" });
  }

  return (
    <main className="mx-auto max-w-md px-5 py-14">
      <div className="rounded-3xl border border-border bg-card p-7 shadow-card">
        <h1 className="font-display text-3xl font-bold">
          {mode === "signin" ? "Welcome back, trainer" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounts let you mint, buy, sell and burn cards.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-6 w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Trainer name"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-poke-blue"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-poke-blue"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-poke-blue"
          />
          {error && <p className="text-xs font-medium text-poke-red">{error}</p>}
          {message && <p className="text-xs font-medium text-poke-green">{message}</p>}
          <button type="submit" disabled={busy} className="poke-btn w-full justify-center">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="mt-5 w-full text-center text-xs text-muted-foreground underline underline-offset-4"
        >
          {mode === "signin" ? "No account yet? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
