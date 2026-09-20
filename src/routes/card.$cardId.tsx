import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { OfferPanel } from "@/components/OfferPanel";
import { PokeCard } from "@/components/PokeCard";
import { PurchaseReveal } from "@/components/PurchaseReveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { getCard, getCardEvents } from "@/lib/queries";
import { burnCard, buyCardWithSol } from "@/lib/wallet.functions";

export const Route = createFileRoute("/card/$cardId")({
  head: () => ({
    meta: [
      { title: "NFT · JPEG" },
      { name: "description", content: "A one-of-one NFT launched on JPEG." },
      { property: "og:title", content: "NFT · JPEG" },
      { property: "og:description", content: "A one-of-one NFT launched on JPEG." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardPage,
  errorComponent: () => (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">This NFT didn't load</h1>
      <Link to="/cards" className="poke-btn mt-6 inline-flex">
        Back to all NFTs
      </Link>
    </main>
  ),
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">NFT not found</h1>
    </main>
  ),
});

function CardPage() {
  const { cardId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [burnNote, setBurnNote] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const buyOnChain = useServerFn(buyCardWithSol);
  const burnOnChain = useServerFn(burnCard);

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
        setShowReveal(true);
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
        return;
      }
      if (kind === "unlist") {
        const { error: err } = await supabase
          .from("cards")
          .update({ list_price: null })
          .eq("id", cardId);
        if (err) throw err;
        return;
      }
      const res = await burnOnChain({ data: { cardId } });
      setBurnNote(
        res.refunded
          ? `NFT burned — ${res.amount} SOL burn reward sent to your wallet.`
          : "NFT burned. The burn reward could not be sent right now.",
      );
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
        <h1 className="font-display text-2xl font-bold">NFT not found</h1>
        <Link to="/cards" className="poke-btn mt-6 inline-flex">
          Back to all NFTs
        </Link>
      </main>
    );
  }

  const isOwner = !!user && user.id === card.owner_id;
  const burned = card.status === "burned";

  // Oldest → newest chain of owners, built from the sale events.
  const sales = (events ?? [])
    .filter((ev) => ev.kind === "sale")
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const owners: string[] =
    sales.length === 0
      ? []
      : [
          sales[0]!.counterparty?.username ?? card.creator?.username ?? "—",
          ...sales.map((s) => s.actor?.username ?? "—"),
        ];

  return (
    <>
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link to="/cards" className="text-xs font-semibold text-muted-foreground hover:underline">
        ← All NFTs
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[320px_1fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <PokeCard card={card} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase">
              1 of 1
            </span>
            {burned && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase text-foreground">
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

          <div className="mt-6 rounded-2xl border border-border bg-secondary p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Pump.fun contract address</p>
            <p className="mono-num mt-1 break-all text-xs text-poke-yellow">
              {card.contract_address}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
              <a href={`https://pump.fun/coin/${card.contract_address}`} target="_blank" rel="noreferrer" className="text-poke-yellow underline underline-offset-4">View on Pump.fun ↗</a>
              {card.launch_tx_signature ? <a href={`https://solscan.io/tx/${card.launch_tx_signature}`} target="_blank" rel="noreferrer" className="text-poke-yellow underline underline-offset-4">Launch receipt ↗</a> : null}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
            {!user ? (
              <div>
                <p className="text-sm text-muted-foreground">
                  Sign in to buy this NFT or mint one of your own.
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
                <p className="text-sm font-semibold">You own this NFT.</p>
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
                     if (
                      confirm(
                        `Burn ${card.name}? The name becomes mintable by anyone again. You get 0.01 SOL back.`,
                      )
                    )
                      action.mutate("burn");
                  }}
                  disabled={action.isPending}
                  className="block text-xs font-semibold text-poke-red underline underline-offset-4"
                >
                  Burn this NFT
                </button>
              </div>
            ) : card.list_price !== null ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="mono-num font-display text-3xl font-bold">
                  {card.list_price} SOL
                </span>
                <button
                  onClick={() => action.mutate("buy")}
                  disabled={action.isPending}
                  className="poke-btn w-full px-8 py-4 text-lg font-extrabold uppercase tracking-wide sm:w-auto"
                >
                  {action.isPending ? "Buying…" : `Buy for ${card.list_price} SOL`}
                </button>

                <span className="w-full text-xs text-muted-foreground">
                  Paid straight from your JPEG wallet to the owner, on Solana.
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This NFT is not for sale right now.
              </p>
            )}
            {error && <p className="mt-3 text-sm font-medium text-poke-red">{error}</p>}
            {burnNote && (
              <p className="mt-3 text-sm font-medium text-poke-green">{burnNote}</p>
            )}
            {txSig && (
              <a
                href={`https://solscan.io/tx/${txSig}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block text-sm font-bold text-poke-blue underline"
              >
                Payment confirmed — view on Solscan
              </a>
            )}
          </div>

          {user && !burned ? (
            <OfferPanel cardId={card.id} userId={user.id} isOwner={isOwner} />
          ) : null}

          {/* Ownership chain */}
          <h2 className="mt-8 font-display text-xl font-bold">Previous owners</h2>
          <div className="mt-2 rounded-2xl border border-border bg-card p-4">
            {owners.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {user ? "Still with its original minter — never sold." : "Sign in to see the owner history."}
              </p>
            ) : (
              <ol className="flex flex-wrap items-center gap-2 text-sm">
                {owners.map((name, i) => (
                  <li key={`${name}-${i}`} className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 font-semibold ${
                        i === owners.length - 1
                          ? "bg-poke-yellow/25 text-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {name}
                      {i === 0 ? " · minted" : ""}
                      {i === owners.length - 1 ? " · now" : ""}
                    </span>
                    {i < owners.length - 1 ? <span className="text-muted-foreground">→</span> : null}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* History */}
          <h2 className="mt-8 font-display text-xl font-bold">Full history</h2>
          <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
            {!user ? (
              <p className="p-4 text-sm text-muted-foreground">
                <Link to="/auth" className="font-bold text-poke-blue underline">
                  Sign in
                </Link>{" "}
                to see this NFT's full history.
              </p>
            ) : (events ?? []).length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              (events ?? []).map((ev) => (
                <div key={ev.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                      ev.kind === "sale"
                        ? "bg-poke-green/15 text-poke-green"
                        : ev.kind === "burn"
                          ? "bg-poke-red/15 text-poke-red"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {ev.kind}
                  </span>
                  <span className="font-semibold">
                    {ev.kind === "sale"
                      ? `${ev.counterparty?.username ?? "—"} → ${ev.actor?.username ?? "—"}`
                      : (ev.actor?.username ?? "—")}
                  </span>
                  <span className="mono-num text-xs text-muted-foreground">
                    {ev.price !== null ? `${ev.price} SOL` : ""}
                  </span>
                  <span className="mono-num ml-auto text-xs text-muted-foreground">
                    {new Date(ev.created_at).toLocaleString()}
                  </span>
                  {ev.tx_signature ? (
                    <a
                      href={`https://solscan.io/tx/${ev.tx_signature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-poke-blue underline"
                    >
                      Solscan
                    </a>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
    {showReveal && txSig ? (
      <PurchaseReveal card={{ ...card, owner_id: user?.id ?? card.owner_id, owner: { username: "you" } }} signature={txSig} onClose={() => setShowReveal(false)} />
    ) : null}
    </>
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
