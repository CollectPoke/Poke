import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { NftCard } from "@/components/NftCard";
import { listCards } from "@/lib/queries";

export const Route = createFileRoute("/cards")({
  head: () => ({
    meta: [
      { title: "All NFTs · JPEG" },
      {
        name: "description",
        content: "Browse every one-of-one NFT launched on JPEG. One name, one NFT, forever.",
      },
      { property: "og:title", content: "All NFTs · JPEG" },
      {
        property: "og:description",
        content: "Browse every one-of-one NFT launched on JPEG. One name, one NFT, forever.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const [search, setSearch] = useState("");
  const [forSaleOnly, setForSaleOnly] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["cards"],
    queryFn: () => listCards(),
  });

  const cards = (data ?? []).filter((c) => {
    if (forSaleOnly && c.list_price === null) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q);
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl font-bold">All NFTs</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every name can only be minted once. If you see it here, it can never be launched again.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or ticker"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-link sm:w-56"
        />
        <button onClick={() => setForSaleOnly(!forSaleOnly)} className={filterClass(forSaleOnly)}>
          For sale
        </button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading NFTs…</p>
      ) : error ? (
        <p className="mt-10 text-sm text-danger">Could not load cards. Try refreshing.</p>
      ) : cards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-xl font-bold">No cards here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to claim a name before someone else does.
          </p>
          <Link to="/mint" className="primary-btn mt-5 inline-flex">
            Mint an NFT
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.id} to="/card/$cardId" params={{ cardId: card.id }}>
              <NftCard card={card} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function filterClass(active: boolean) {
  return [
    "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
    active
      ? "border-brand bg-brand text-brand-foreground"
      : "border-border bg-card hover:bg-secondary",
  ].join(" ");
}
