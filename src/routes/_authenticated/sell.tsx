import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { OfferPanel } from "@/components/OfferPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { myCards } from "@/lib/queries";
import type { CardWithPeople } from "@/lib/cards";

export const Route = createFileRoute("/_authenticated/sell")({
  head: () => ({
    meta: [
      { title: "Sell NFTs · JPEG" },
      { name: "description", content: "List your JPEG NFTs for sale in SOL." },
      { property: "og:title", content: "Sell NFTs · JPEG" },
      { property: "og:description", content: "List your JPEG NFTs for sale in SOL." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ cardId: string; text: string; bad?: boolean } | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["my-cards", userId],
    queryFn: () => myCards(userId),
    enabled: !!userId,
  });

  const owned = (data ?? []).filter((c) => c.status === "minted");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["my-cards"] });
    queryClient.invalidateQueries({ queryKey: ["cards"] });
    queryClient.invalidateQueries({ queryKey: ["cards", "for-sale"] });
  };

  const action = useMutation({
    mutationFn: async (input: { cardId: string; kind: "list" | "unlist"; price?: string }) => {
      if (input.kind === "unlist") {
        const { error: err } = await supabase
          .from("cards")
          .update({ list_price: null })
          .eq("id", input.cardId);
        if (err) throw err;
        return;
      }
      const value = Number(input.price);
      if (!value || value <= 0) throw new Error("Enter a price above zero.");
      const { error: err } = await supabase
        .from("cards")
        .update({ list_price: value })
        .eq("id", input.cardId);
      if (err) throw err;
    },
    onSuccess: (_res, input) => {
      setNotice({
        cardId: input.cardId,
        text: input.kind === "list" ? "Listed for sale!" : "Listing removed.",
      });
      setPrices((p) => ({ ...p, [input.cardId]: "" }));
      refresh();
    },
    onError: (err, input) => {
      setNotice({
        cardId: input.cardId,
        text: err instanceof Error ? err.message : "Something went wrong.",
        bad: true,
      });
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl font-bold">Sell</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        List your NFTs for sale in SOL, or wait for collectors to send you an offer. Either way the
        SOL lands straight in your JPEG wallet.
      </p>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading your NFTs…</p>
      ) : owned.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-xl font-bold">You don't own any NFTs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mint or buy an NFT first, then list it here.
          </p>
          <Link to="/mint" className="poke-btn mt-5 inline-flex">
            Mint an NFT
          </Link>
          <Link to="/buy" className="ml-3 inline-flex rounded-xl border-2 border-border bg-card px-5 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary">
            Browse NFTs for sale
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {owned.map((card) => (
            <div key={card.id}>
              <SellRow
                card={card}
                price={prices[card.id] ?? ""}
                onPriceChange={(v) => setPrices((p) => ({ ...p, [card.id]: v }))}
                onList={() =>
                  action.mutate({ cardId: card.id, kind: "list", price: prices[card.id] ?? "" })
                }
                onUnlist={() => action.mutate({ cardId: card.id, kind: "unlist" })}
                busy={action.isPending}
                notice={notice?.cardId === card.id ? notice : null}
              />
              <OfferPanel cardId={card.id} userId={userId} isOwner />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function SellRow({
  card,
  price,
  onPriceChange,
  onList,
  onUnlist,
  busy,
  notice,
}: {
  card: CardWithPeople;
  price: string;
  onPriceChange: (v: string) => void;
  onList: () => void;
  onUnlist: () => void;
  busy: boolean;
  notice: { text: string; bad?: boolean } | null;
}) {
  const listed = card.list_price !== null;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <Link to="/card/$cardId" params={{ cardId: card.id }} className="shrink-0">
        <img
          src={card.image_url ?? "/favicon.png"}
          alt=""
          className="h-20 w-20 rounded-xl border border-border object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to="/card/$cardId"
          params={{ cardId: card.id }}
          className="font-display text-lg font-bold hover:text-poke-blue"
        >
          {card.name}
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {card.ticker}
        </p>
        <p className="mt-1 text-sm">
          {listed ? (
            <span className="font-bold text-poke-blue">{card.list_price} SOL · listed</span>
          ) : (
            <span className="text-muted-foreground">Not listed</span>
          )}
        </p>
        {notice ? (
          <p className={`mt-1 text-xs font-semibold ${notice.bad ? "text-poke-red" : "text-poke-blue"}`}>
            {notice.text}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {listed ? (
          <button
            onClick={onUnlist}
            disabled={busy}
            className="rounded-xl border-2 border-border bg-card px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Remove listing
          </button>
        ) : (
          <>
            <div className="flex items-center rounded-xl border-2 border-border bg-card px-3">
              <input
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className="w-16 bg-transparent py-2.5 text-sm font-semibold outline-none"
                aria-label={`Price in SOL for ${card.name}`}
              />
              <span className="text-sm font-bold text-muted-foreground">SOL</span>
            </div>
            <button onClick={onList} disabled={busy} className="poke-btn !py-2.5 disabled:opacity-50">
              List for sale
            </button>
          </>
        )}
      </div>
    </div>
  );
}
