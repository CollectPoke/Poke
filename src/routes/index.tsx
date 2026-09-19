import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CATALOG, spriteUrl, TYPE_CLASS } from "@/lib/catalog";
import { marketsQueryOptions } from "@/lib/markets-query";
import { formatChange, formatCompact, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PokéPad — every trade buys a real graded card" },
      {
        name: "description",
        content:
          "Every memecoin is paired to a creature and traded live. Trading fees buy real graded Pokémon cards into the vault.",
      },
      { property: "og:title", content: "PokéPad — every trade buys a real graded card" },
      {
        property: "og:description",
        content: "Coins paired to creatures, live prices, and fees that buy real graded slabs.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(marketsQueryOptions),
  component: DexIndex,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Nothing here.</div>,
});

function DexIndex() {
  const { data } = useSuspenseQuery(marketsQueryOptions);
  const [q, setQ] = useState("");

  const byId = new Map(data.markets.map((m) => [m.id, m]));
  const query = q.trim().toLowerCase();
  const entries = CATALOG.filter(
    (e) =>
      !query ||
      [e.coinName, e.ticker, e.pokemonName, e.type].some((s) =>
        s.toLowerCase().includes(query),
      ),
  ).sort((a, b) => (byId.get(b.id)?.marketCap ?? 0) - (byId.get(a.id)?.marketCap ?? 0));

  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
      <header className="max-w-2xl">
        <span className="mono-num text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {CATALOG.length} pairs live · {totals.count} slabs bought
        </span>
        <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl">
          Every trade buys a
          <em className="italic"> real graded card</em>.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Each memecoin is paired to a creature and tracked live. Trading fees go straight into
          buying graded Pokémon cards, and every slab shows up in the vault with its cert number.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/vault"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            See the vault
          </Link>
          <span className="mono-num text-xs text-muted-foreground">
            {usd(totals.spent)} spent on cards so far
          </span>
        </div>
      </header>


      <div className="mt-10 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search coin, ticker, or creature"
          className="w-full max-w-sm rounded-full border border-border bg-card px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
        />
        {data.error && <span className="text-xs text-muted-foreground">{data.error}</span>}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => {
          const m = byId.get(e.id);
          const up = (m?.change24h ?? 0) >= 0;
          return (
            <Link
              key={e.id}
              to="/dex/$coinId"
              params={{ coinId: e.id }}
              className="dex-card dex-card-interactive group flex flex-col p-5"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${TYPE_CLASS[e.type]}`}
                >
                  {e.type}
                </span>
                <span className="mono-num text-[11px] text-muted-foreground">
                  #{String(e.pokemonId).padStart(3, "0")}
                </span>
              </div>

              <img
                src={spriteUrl(e.pokemonId)}
                alt={e.pokemonName}
                loading="lazy"
                className="mx-auto h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-105"
              />

              <div className="mt-2">
                <h2 className="text-2xl leading-tight">{e.coinName}</h2>
                <p className="mono-num text-xs text-muted-foreground">
                  {e.ticker} · {e.pokemonName}
                </p>
              </div>

              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="mono-num text-base">{formatPrice(m?.price ?? null)}</span>
                <span
                  className={`mono-num text-sm ${up ? "text-success" : "text-danger"}`}
                >
                  {formatChange(m?.change24h ?? null)}
                </span>
              </div>
              <span className="mono-num mt-1 text-[11px] text-muted-foreground">
                MC {formatCompact(m?.marketCap ?? null)}
              </span>
            </Link>
          );
        })}
      </div>

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        Prices from CoinGecko. Creature pairings are for entertainment only — not financial advice.
      </footer>
    </main>
  );
}
