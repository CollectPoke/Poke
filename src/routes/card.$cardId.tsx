import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { PokeCard } from "@/components/PokeCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { rarityStyle } from "@/lib/cards";
import { getCard, getCardEvents } from "@/lib/queries";

export const Route = createFileRoute("/card/$cardId")({
  head: () => ({
    meta: [
      { title: "Card · Poke" },
      { name: "description", content: "A one-of-one card launched on Poke." },
      { property: "og:title", content: "Card · Poke" },
      { property: "og:description", content: "A one-of-one card launched on Poke." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardPage,
  errorComponent: () => (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">This card didn't load</h1>
      <Link to="/cards" className="poke-btn mt-6 inline-flex">
        Back to all cards
      </Link>
    </main>
  ),
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Card not found</h1>
    </main>
  ),
});

function CardPage() {
  const { cardId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: card, isLoading } = useQuery({
    queryKey: ["card", cardId],
    queryFn: () => getCard(cardId),
  });
  const { data: events } = useQuery({
    queryKey: ["card-events", cardId],
    queryFn: () => getCardEvents(cardId),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    queryClient.invalidateQueries({ queryKey: ["card-events", cardId] });
    queryClient.invalidateQueries({ queryKey: ["cards"] });
    queryClient.invalidateQueries({ queryKey: ["my-cards"] });
  };

  const action = useMutation({
    mutationFn: async (kind: "buy" | "list" | "unlist" | "burn") => {
      if (!user) throw new Error("Sign in first.");
      if (kind === "buy") {
        const res = await buyOnChain({ data: { cardId } });
        setTxSig(res.signature);
        return;
      }
      if (kind === "list") {
        const value = Number(price);
        if (!value || value <= 0) throw new Error("Enter a price above zero.");
        const { error: err } = await supabase
          .from("cards")
          .update({ list_price: value })
          .eq("id", cardId);
        if (err) throw err;
        await supabase
          .from("card_events")
          .insert({ card_id: cardId, kind: "list", actor_id: user.id, price: value });
        return;
      }
      if (kind === "unlist") {
        const { error: err } = await supabase
          .from("cards")
          .update({ list_price: null })
          .eq("id", cardId);
        if (err) throw err;
        await supabase
          .from("card_events")
          .insert({ card_id: cardId, kind: "unlist", actor_id: user.id });
        return;
      }
      const { error: err } = await supabase
        .from("cards")
        .update({ status: "burned", list_price: null })
        .eq("id", cardId);
      if (err) throw err;
      await supabase
        .from("card_events")
        .insert({ card_id: cardId, kind: "burn", actor_id: user.id });
    },
    onSuccess: () => {
      setError(null);
      setPrice("");
      refresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Something went wrong."),
  });

  if (isLoading) {
    return <main className="mx-auto max-w-5xl px-5 py-20 text-sm text-muted-foreground">Loading…</main>;
  }
  if (!card) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Card not found</h1>
        <Link to="/cards" className="poke-btn mt-6 inline-flex">
          Back to all cards
        </Link>
      </main>
    );
  }

  const isOwner = !!user && user.id === card.owner_id;
  const burned = card.status === "burned";

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link to="/cards" className="text-xs font-semibold text-muted-foreground hover:underline">
        ← All cards
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[320px_1fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <PokeCard card={card} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${rarityStyle(card.rarity)}`}>
              {card.rarity}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase">
              1 of 1
            </span>
            {burned && (
              <span className="rounded-full bg-poke-navy px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                Burned — name released
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold">{card.name}</h1>
          <p className="mono-num text-sm uppercase tracking-widest text-muted-foreground">
            ${card.ticker}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {card.description || "No description."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Info label="Owner" value={card.owner?.username ?? "—"} />
            <Info label="Minted by" value={card.creator?.username ?? "—"} />
            <Info
              label="Price"
              value={card.list_price !== null ? `${card.list_price} SOL` : "Not listed"}
            />
            <Info
              label="Last sale"
              value={card.last_price !== null ? `${card.last_price} SOL` : "Never sold"}
            />
          </div>

          <div className="mt-6 rounded-2xl bg-poke-navy p-4">
            <p className="text-[10px] uppercase tracking-widest text-white/50">Contract address</p>
            <p className="mono-num mt-1 break-all text-xs text-poke-yellow">
              {card.contract_address}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
            {!user ? (
              <div>
                <p className="text-sm text-muted-foreground">
                  Sign in to buy this card or mint one of your own.
                </p>
                <Link to="/auth" className="poke-btn mt-3 inline-flex">
                  Sign in
                </Link>
              </div>
            ) : burned ? (
              <p className="text-sm text-muted-foreground">
                This card was burned. The name "{card.name}" is free to mint again.
              </p>
            ) : isOwner ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold">You own this card.</p>
                {card.list_price === null ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price in SOL"
                      className="w-40 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-poke-blue"
                    />
                    <button
                      onClick={() => action.mutate("list")}
                      disabled={action.isPending}
                      className="poke-btn"
                    >
                      List for sale
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => action.mutate("unlist")}
                    disabled={action.isPending}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
                  >
                    Remove listing
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Burn ${card.name}? The name becomes mintable by anyone again.`))
                      action.mutate("burn");
                  }}
                  disabled={action.isPending}
                  className="block text-xs font-semibold text-poke-red underline underline-offset-4"
                >
                  Burn this card
                </button>
              </div>
            ) : card.list_price !== null ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="mono-num font-display text-2xl font-bold">
                  {card.list_price} SOL
                </span>
                <button
                  onClick={() => action.mutate("buy")}
                  disabled={action.isPending}
                  className="poke-btn"
                >
                  {action.isPending ? "Buying…" : "Buy this card"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This card is not for sale right now.
              </p>
            )}
            {error && <p className="mt-3 text-sm font-medium text-poke-red">{error}</p>}
          </div>

          {/* History */}
          <h2 className="mt-8 font-display text-xl font-bold">History</h2>
          <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
            {(events ?? []).length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              (events ?? []).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="font-semibold capitalize">{ev.kind}</span>
                  <span className="text-muted-foreground">{ev.actor?.username ?? "—"}</span>
                  <span className="mono-num text-xs text-muted-foreground">
                    {ev.price !== null ? `${ev.price} SOL` : ""}
                  </span>
                  <span className="mono-num text-xs text-muted-foreground">
                    {new Date(ev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
