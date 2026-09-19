import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { COINS } from "@/lib/pokepad";
import { spriteUrl } from "@/lib/catalog";
import { formatCompact } from "@/lib/format";

export const Route = createFileRoute("/coins")({
  component: CoinsPage,
  head: () => ({
    meta: [
      { title: "Coins collecting cards · PokéPad" },
      {
        name: "description",
        content:
          "Every coin launched on PokéPad, what it collects, its card pot and how many real graded cards it has sent to holders.",
      },
      { property: "og:title", content: "Coins collecting cards · PokéPad" },
      {
        property: "og:description",
        content: "Browse PokéPad coins, their card picks, pots and purchase history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CoinsPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = COINS.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.ticker.toLowerCase().includes(q) ||
      c.collects.toLowerCase().includes(q),
  ).sort((a, b) => b.marketCap - a.marketCap);

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-10 pb-6">
        <div>
          <h1 className="font-display text-4xl">Coins</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every one of them is a real pump.fun coin paired with CARDS.
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search coin, ticker or Pokémon"
          className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30 sm:w-72"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((c) => (
          <Link
            key={c.id}
            to="/coin/$coinId"
            params={{ coinId: c.id }}
            className="dex-card dex-card-interactive flex gap-4 p-4"
          >
            <img
              src={spriteUrl(c.pokemonId || 25)}
              alt=""
              loading="lazy"
              className="h-20 w-20 shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-display text-xl">{c.name}</span>
                <span className="mono-num text-xs text-muted-foreground">${c.ticker}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Collects {c.collects} · {c.gradeFloor}
              </p>
              <div className="mono-num mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>mcap {formatCompact(c.marketCap)}</span>
                <span>pot ${c.pot.toLocaleString()}</span>
                <span>{c.cardsSent} cards sent</span>
                <span
                  className={
                    c.status === "Graduated" ? "text-success" : "text-foreground/70"
                  }
                >
                  {c.status === "Graduated" ? "graduated" : `curve ${c.curveProgress}%`}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">No coins match that.</p>
      )}
    </main>
  );
}
