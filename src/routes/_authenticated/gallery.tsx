import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { NftCard } from "@/components/NftCard";
import { useAuth } from "@/lib/auth";
import { myMintedCards } from "@/lib/queries";
import { formatSolAmount } from "@/lib/cards";

export const Route = createFileRoute("/_authenticated/gallery")({
  head: () => ({
    meta: [
      { title: "My NFTs · JPEG" },
      { name: "description", content: "Every NFT you minted on JPEG, with its artwork and coin." },
      { property: "og:title", content: "My NFTs · JPEG" },
      {
        property: "og:description",
        content: "Every NFT you minted on JPEG, with its artwork and coin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "price-desc" | "price-asc">("newest");

  const { data: cards, isLoading } = useQuery({
    queryKey: ["my-minted", userId],
    queryFn: () => myMintedCards(userId),
    enabled: !!userId,
  });


  const priceOf = (c: { list_price: number | null; last_price: number | null }) =>
    c.list_price ?? c.last_price ?? null;

  const shown = (cards ?? [])
    .filter((c) => {
      const min = minPrice.trim() === "" ? null : Number(minPrice);
      const max = maxPrice.trim() === "" ? null : Number(maxPrice);
      if (min !== null || max !== null) {
        const p = priceOf(c);
        if (p === null) return false;
        if (min !== null && !Number.isNaN(min) && p < min) return false;
        if (max !== null && !Number.isNaN(max) && p > max) return false;
      }

      const needle = q.trim().toLowerCase();
      if (!needle) return true;
      return c.name.toLowerCase().includes(needle) || c.ticker.toLowerCase().includes(needle);
    })
    .sort((a, b) => {
      if (sort === "newest") return b.created_at.localeCompare(a.created_at);
      if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
      const pa = priceOf(a);
      const pb = priceOf(b);
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return sort === "price-desc" ? pb - pa : pa - pb;
    });

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setQ("");
    setSort("newest");
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">My NFTs</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every NFT you have minted, with its artwork and the coin attached to it.
        </p>
      </header>

      <div className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your NFTs…"
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-sm font-medium outline-none focus:border-link sm:max-w-xs"
          />
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-link"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price-desc">Price: high to low</option>
              <option value="price-asc">Price: low to high</option>
            </select>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:ml-2">
              Price (SOL)
            </span>
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              inputMode="decimal"
              placeholder="Min"
              className="mono-num w-24 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm outline-none focus:border-link"
            />
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              inputMode="decimal"
              placeholder="Max"
              className="mono-num w-24 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm outline-none focus:border-link"
            />
            <button
              onClick={resetFilters}
              className="ml-auto rounded-xl border-2 border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"
            >
              Reset
            </button>
          </div>
        </div>

        <p className="text-xs font-semibold text-muted-foreground">
          Showing {shown.length} of {cards?.length ?? 0} cards
        </p>
      </div>


      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading your gallery…</p>
      ) : shown.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-ink/20 bg-card p-12 text-center">
          <p className="font-display text-xl font-bold text-foreground">Nothing here yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Mint an NFT and it shows up here with its artwork and pairing.
          </p>
          <Link to="/mint" className="primary-btn mt-5 inline-block">
            Mint an NFT
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {shown.map((card) => {
            return (
              <div
                key={card.id}
                className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:flex-row"
              >
                <Link
                  to="/card/$cardId"
                  params={{ cardId: card.id }}
                  className="w-full shrink-0 transition-transform duration-300 hover:-translate-y-1 sm:w-48"
                >
                  <NftCard card={card} compact />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {card.status !== "minted" && (
                      <span className="rounded-full bg-danger/15 px-2.5 py-1 text-[11px] font-bold text-danger">
                        Burned
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
                    {card.name} <span className="text-muted-foreground">${card.ticker}</span>
                  </h2>

                  <dl className="mono-num mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Listed at</dt>
                      <dd className="text-foreground">
                        {card.list_price !== null ? `${formatSolAmount(card.list_price)} SOL` : "Not for sale"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last sale</dt>
                      <dd className="text-foreground">
                        {card.last_price !== null ? `${formatSolAmount(card.last_price)} SOL` : "—"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-2xl border border-border bg-secondary/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Attached coin
                    </p>
                    <p className="mono-num mt-2 break-all text-xs text-foreground">
                      {card.contract_address}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

