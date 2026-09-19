import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CATALOG_BY_ID, spriteUrl, TYPE_CLASS } from "@/lib/catalog";
import { marketsQueryOptions } from "@/lib/markets-query";
import { formatChange, formatCompact, formatPrice, stats } from "@/lib/format";
import { StatBar } from "@/components/StatBar";

export const Route = createFileRoute("/dex/$coinId")({
  loader: async ({ context, params }) => {
    if (!CATALOG_BY_ID[params.coinId]) throw notFound();
    await context.queryClient.ensureQueryData(marketsQueryOptions);
  },
  head: ({ params }) => {
    const entry = CATALOG_BY_ID[params.coinId];
    if (!entry) {
      return {
        meta: [{ title: "Not found — Memedex" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${entry.coinName} × ${entry.pokemonName} — Memedex`;
    const description = `${entry.coinName} (${entry.ticker}) paired with ${entry.pokemonName}. Live price, market cap and battle stats.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: DexDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <h1 className="text-3xl">No such entry</h1>
      <Link to="/" className="mt-4 inline-block text-sm underline">
        Back to the dex
      </Link>
    </div>
  ),
});

function DexDetail() {
  const { coinId } = Route.useParams();
  const { data } = useSuspenseQuery(marketsQueryOptions);
  const entry = CATALOG_BY_ID[coinId]!;
  const m = data.markets.find((x) => x.id === coinId) ?? {
    id: coinId,
    price: null,
    change24h: null,
    marketCap: null,
    volume24h: null,
    rank: null,
    high24h: null,
    low24h: null,
    ath: null,
  };
  const s = stats(m);
  const up = (m.change24h ?? 0) >= 0;

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:py-20">
      <Link to="/" className="mono-num text-xs uppercase tracking-widest text-muted-foreground">
        ← Dex
      </Link>

      <div className="dex-card mt-6 overflow-hidden">
        <div className="grid gap-8 p-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-10">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-surface p-6">
            <img
              src={spriteUrl(entry.pokemonId)}
              alt={entry.pokemonName}
              className="h-52 w-52 object-contain"
            />
            <span className="mono-num mt-2 text-xs text-muted-foreground">
              #{String(entry.pokemonId).padStart(3, "0")} {entry.pokemonName}
            </span>
          </div>

          <div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${TYPE_CLASS[entry.type]}`}
            >
              {entry.type}
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl">{entry.coinName}</h1>
            <p className="mono-num text-sm text-muted-foreground">{entry.ticker}</p>
            <p className="mt-4 text-base text-muted-foreground">{entry.flavor}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="mono-num text-3xl">{formatPrice(m.price)}</span>
              <span className={`mono-num text-sm ${up ? "text-success" : "text-danger"}`}>
                {formatChange(m.change24h)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
          {[
            ["Market cap", formatCompact(m.marketCap)],
            ["24h volume", formatCompact(m.volume24h)],
            ["24h high", formatPrice(m.high24h)],
            ["24h low", formatPrice(m.low24h)],
          ].map(([label, value]) => (
            <div key={label} className="border-l border-border p-5 first:border-l-0">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {label}
              </div>
              <div className="mono-num mt-1 text-sm">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="dex-card mt-6 p-8">
        <h2 className="text-2xl">Battle stats</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Derived from live market data — they move when the market moves.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <StatBar label="HP (market cap)" value={s.hp} />
          <StatBar label="Attack (24h move)" value={s.attack} />
          <StatBar label="Speed (volume)" value={s.speed} />
          <StatBar label="Volatility" value={s.volatility} />
        </div>
      </section>

      {data.error && (
        <p className="mt-6 text-xs text-muted-foreground">{data.error}</p>
      )}
    </main>
  );
}
