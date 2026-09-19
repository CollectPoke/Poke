import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { PokeCard } from "@/components/PokeCard";
import { listCards } from "@/lib/queries";

export const Route = createFileRoute("/buy")({
  head: () => ({
    meta: [
      { title: "Buy cards · Poke" },
      {
        name: "description",
        content: "Every Poke card listed for sale right now. One name, one card, forever.",
      },
      { property: "og:title", content: "Buy cards · Poke" },
      {
        property: "og:description",
        content: "Every Poke card listed for sale right now. One name, one card, forever.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuyPage,
});

type SortKey = "newest" | "price-low" | "price-high";

function BuyPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const { data, isLoading, error } = useQuery({
    queryKey: ["cards", "for-sale"],
    queryFn: () => listCards({ forSaleOnly: true }),
  });

  const cards = (data ?? [])
    .filter((c) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "price-low") return (a.list_price ?? 0) - (b.list_price ?? 0);
      if (sort === "price-high") return (b.list_price ?? 0) - (a.list_price ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl font-bold">Buy</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cards other trainers have listed for sale. Tap a card to buy it with your Poke wallet.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or ticker"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-poke-blue sm:w-56"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-poke-blue"
          aria-label="Sort cards"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading cards…</p>
      ) : error ? (
        <p className="mt-10 text-sm text-poke-red">Could not load cards. Try refreshing.</p>
      ) : cards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-xl font-bold">Nothing for sale right now</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon — or browse every card ever minted.
          </p>
          <Link to="/cards" className="poke-btn mt-5 inline-flex">
            All cards
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.id} to="/card/$cardId" params={{ cardId: card.id }}>
              <PokeCard card={card} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
