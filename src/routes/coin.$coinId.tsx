import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { COINS_BY_ID, FEE_SPLIT, MIN_HOLD } from "@/lib/pokepad";
import { spriteUrl } from "@/lib/catalog";
import { formatCompact } from "@/lib/format";

export const Route = createFileRoute("/coin/$coinId")({
  loader: ({ params }) => {
    const coin = COINS_BY_ID[params.coinId];
    if (!coin) throw notFound();
    return coin;
  },
  component: CoinPage,
  head: ({ loaderData }) => {
    const name = loaderData ? `${loaderData.name} ($${loaderData.ticker})` : "Coin";
    const desc = loaderData
      ? `${loaderData.name} collects ${loaderData.collects} (${loaderData.gradeFloor}). ${loaderData.cardsSent} real graded cards sent to holders so far.`
      : "A Poke coin that buys real graded cards for its holders.";
    return {
      meta: [
        { title: `${name} · Poke` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} · Poke` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="mono-num text-sm">{value}</span>
    </div>
  );
}

function CoinPage() {
  const coin = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16">
      <Link
        to="/coins"
        className="mono-num mt-8 inline-block text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        ← all coins
      </Link>

      <header className="mt-5 flex flex-wrap items-center gap-6">
        <img src={spriteUrl(coin.pokemonId || 25)} alt="" className="h-28 w-28 object-contain" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl">{coin.name}</h1>
          <p className="mono-num mt-1 text-sm text-muted-foreground">
            ${coin.ticker} · paired with CARDS · {coin.status.toLowerCase()} · launched{" "}
            {coin.createdAgo}
          </p>
          <p className="mt-2 text-sm">
            Collects <strong>{coin.collects}</strong>, grade floor{" "}
            <strong>{coin.gradeFloor}</strong>. Fixed at launch, forever.
          </p>
        </div>
        <a
          href="https://pump.fun"
          target="_blank"
          rel="noreferrer"
          className="poke-btn ml-auto"
        >
          Trade on pump.fun
        </a>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          ["Card pot", `$${coin.pot.toLocaleString()}`],
          ["Cards sent", coin.cardsSent.toString()],
          ["Card value sent", `$${coin.cardsValue.toLocaleString()}`],
          ["Market cap", formatCompact(coin.marketCap)],
        ].map(([label, value]) => (
          <div key={label} className="dex-card p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mono-num mt-1 text-xl">{value}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="dex-card p-5">
          <h2 className="font-display text-2xl">The split</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            1% creator fee on every trade, locked on chain at launch.
          </p>
          <div className="mt-4">
            {FEE_SPLIT.map((s) => (
              <Row key={s.label} label={s.label} value={`${s.pct}%`} />
            ))}
          </div>
          <div className="mono-num mt-4 space-y-1 text-xs text-muted-foreground">
            <p className="break-all">coin wallet · {coin.wallet}</p>
            <p className="break-all">vault (no key exists) · {coin.vault}</p>
          </div>
        </section>

        <section className="dex-card p-5">
          <h2 className="font-display text-2xl">The queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Who is owed what. The top row gets the next card. No draws, no luck.
          </p>
          <div className="mt-4">
            {coin.queue.map((row, i) => (
              <div
                key={row.wallet}
                className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0"
              >
                <span className="mono-num flex items-center gap-2">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {row.wallet}
                </span>
                <span className="mono-num text-muted-foreground">
                  {(row.balance / 1e6).toFixed(1)}M · owed ${row.owed.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Hold at least {(MIN_HOLD / 1e6).toFixed(0)}M coins (0.1% of supply) in an ordinary
            wallet. Credit is the smaller of your balance at the last look and at this one.
          </p>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Cards this coin has bought</h2>
        <div className="mt-4 grid gap-3">
          {coin.purchases.map((p) => (
            <div
              key={p.sig}
              className="dex-card flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="text-sm">
                  <strong>{p.card}</strong>{" "}
                  <span className="text-muted-foreground">· {p.set}</span>
                </p>
                <p className="mono-num mt-0.5 text-xs text-muted-foreground">
                  {p.grader} {p.grade} · {p.cert} · {p.ago}
                </p>
              </div>
              <div className="mono-num text-right text-xs">
                <p>${p.price}</p>
                <p className="text-muted-foreground">
                  → {p.destination === "vault" ? "vault" : p.to} · {p.sig}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
