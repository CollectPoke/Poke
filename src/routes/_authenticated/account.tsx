import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { PokeCard } from "@/components/PokeCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { myCards } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My binder · Poke" },
      { name: "description", content: "The one-of-one Poke cards you own." },
      { property: "og:title", content: "My binder · Poke" },
      { property: "og:description", content: "The one-of-one Poke cards you own." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, username } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";

  const { data: cards, isLoading } = useQuery({
    queryKey: ["my-cards", userId],
    queryFn: () => myCards(userId),
    enabled: !!userId,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const owned = cards ?? [];
  const listed = owned.filter((c) => c.list_price !== null && c.status === "minted");

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Trainer</p>
          <h1 className="font-display text-4xl font-bold">{username ?? "…"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/mint" className="poke-btn">
            Mint a card
          </Link>
          <button
            onClick={signOut}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Cards owned" value={owned.length} />
        <Stat label="Listed for sale" value={listed.length} />
        <Stat label="Minted by you" value={owned.filter((c) => c.creator_id === userId).length} />
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">My binder</h2>
      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading your cards…</p>
      ) : owned.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Your binder is empty. Mint the first card of a name, or buy one from the market.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link to="/mint" className="poke-btn">
              Mint a card
            </Link>
            <Link
              to="/cards"
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              Browse the market
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {owned.map((card) => (
            <Link key={card.id} to="/card/$cardId" params={{ cardId: card.id }}>
              <PokeCard card={card} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mono-num mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
