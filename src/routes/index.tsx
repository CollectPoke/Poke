import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CARDS_SENT,
  COINS,
  FEE_SPLIT,
  MARKET,
  MIN_HOLD,
  SITE_STATS,
} from "@/lib/pokepad";
import { spriteUrl } from "@/lib/catalog";
import { formatCompact } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Poke · Launch a coin, every trade buys real Pokémon cards" },
      {
        name: "description",
        content:
          "Poke is a Solana launchpad where every coin is a real pump.fun coin paired with CARDS. A locked 1% fee buys real graded Pokémon cards and sends them to holders.",
      },
      {
        property: "og:title",
        content: "Poke · Launch a coin, every trade buys real Pokémon cards",
      },
      {
        property: "og:description",
        content:
          "Pick what your coin collects. The fee is locked at launch, the creator gets none of it, and the cards go to holders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="dex-card p-4 text-center">
      <p className="mono-num text-2xl font-medium">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    title: "1 · Launch on pump.fun",
    body: "Same bonding curve, same graduation to PumpSwap. The only difference is the pair: your coin trades against CARDS, Collector Crypt's token, instead of SOL.",
    tile: "bg-poke-blue text-white",
  },
  {
    title: "2 · Pick what it collects",
    body: "Pikachu only, Charizard only, 10s only, or the whole binder. Plus a grade floor. Permanent — you cannot raise on Charizards and switch to commons.",
    tile: "bg-poke-yellow text-poke-navy",
  },
  {
    title: "3 · The fee locks itself",
    body: "The 1% creator fee is locked with pump.fun's own fee-sharing config and the admin key is thrown away in the same transaction. Nobody can repoint it. Not you, not us.",
    tile: "bg-poke-green text-white",
  },
  {
    title: "4 · The engine runs",
    body: "Round the clock: claim fees → swap to USDC → buy the cheapest matching card → send it to the holder who is owed the most.",
    tile: "bg-poke-purple text-white",
  },
];

function Home() {
  const topCoins = [...COINS].sort((a, b) => b.marketCap - a.marketCap).slice(0, 4);
  const feed = CARDS_SENT.slice(0, 5);

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20">
      {/* Hero — big colorful tile, official-site style */}
      <section className="pt-10">
        <div className="overflow-hidden rounded-3xl bg-poke-blue shadow-lg">
          <div className="relative px-8 py-14 sm:px-14">
            <img
              src={spriteUrl(25)}
              alt=""
              className="pointer-events-none absolute -right-6 top-1/2 hidden w-64 -translate-y-1/2 opacity-95 drop-shadow-xl sm:block"
            />
            <p className="mono-num text-xs uppercase tracking-[0.22em] text-white/70">
              a launchpad on solana · every coin is a real pump.fun coin
            </p>
            <h1 className="mt-4 max-w-xl font-display text-5xl font-bold leading-[1.02] text-white drop-shadow sm:text-6xl">
              Every trade buys a real Pokémon card.
            </h1>
            <p className="mt-4 max-w-md text-base text-white/85">
              Each coin pays a 1% fee. The creator gets none of it — it is locked on chain at
              launch, forever. That fee buys real graded slabs and sends them to the wallets
              holding the coin.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/launch" className="poke-btn">
                Launch a coin
              </Link>
              <Link
                to="/coins"
                className="poke-btn bg-white/95 !text-poke-navy"
              >
                Browse coins
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Coins launched" value={SITE_STATS.coinsLaunched.toLocaleString()} />
        <Stat label="Cards sent" value={SITE_STATS.cardsSent.toLocaleString()} />
        <Stat label="Card value" value={`$${SITE_STATS.cardsValue.toLocaleString()}`} />
        <Stat label="$POKE burned" value={`${SITE_STATS.burned}%`} />
      </section>

      {/* How it works — colorful feature tiles */}
      <section className="mt-16">
        <h2 className="text-center font-display text-4xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.title}
              className={`${step.tile} rounded-3xl p-6 shadow-md transition-transform duration-200 hover:-translate-y-1`}
            >
              <p className="font-display text-lg font-bold">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed opacity-90">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Split */}
      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="dex-card p-6">
          <h2 className="font-display text-3xl font-bold">Where the fee goes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Written into the lock when the coin is created. It can never be changed.
          </p>
          <div className="mt-5 space-y-3">
            {FEE_SPLIT.map((s) => (
              <div key={s.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className={s.pct === 0 ? "text-muted-foreground" : ""}>{s.label}</span>
                  <span className="mono-num">{s.pct}%</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${
                      s.pct === 70
                        ? "bg-poke-green"
                        : s.pct === 20
                          ? "bg-poke-blue"
                          : s.pct === 10
                            ? "bg-poke-yellow"
                            : "bg-secondary"
                    }`}
                    style={{ width: `${Math.max(s.pct, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-poke-purple p-6 text-white shadow-md">
            <h3 className="font-display text-2xl font-bold">Holders do nothing</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-90">
              No claiming, no forms, no staking. Hold at least {(MIN_HOLD / 1e6).toFixed(0)}M coins
              (0.1% of supply) and cards land in the same wallet. Credit is the smaller of your
              balance at the last look and at this one, so buying a minute before a round earns
              nothing from it. No raffle, no random draw — every coin's page shows the queue.
            </p>
          </div>
          <div className="rounded-3xl bg-poke-red p-6 text-white shadow-md">
            <h3 className="font-display text-2xl font-bold">The burn</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-90">
              20% of every coin's fee buys $POKE on the open market and burns it, the same
              round, from one wallet that belongs to the site itself. {SITE_STATS.burns} burns so
              far · latest {SITE_STATS.lastBurnSig}.
            </p>
          </div>
        </div>
      </section>

      {/* Coins */}
      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-bold">Coins collecting right now</h2>
          <Link
            to="/coins"
            className="text-sm font-semibold text-poke-blue hover:underline"
          >
            All coins →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {topCoins.map((c) => (
            <Link
              key={c.id}
              to="/coin/$coinId"
              params={{ coinId: c.id }}
              className="dex-card dex-card-interactive flex gap-4 p-4"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface">
                <img
                  src={spriteUrl(c.pokemonId || 25)}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-display text-xl font-bold">{c.name}</span>
                  <span className="mono-num text-xs text-muted-foreground">${c.ticker}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Collects {c.collects} · {c.gradeFloor}
                </p>
                <p className="mono-num mt-3 text-xs text-muted-foreground">
                  mcap {formatCompact(c.marketCap)} · {c.cardsSent} cards sent
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-bold">Cards sent</h2>
          <Link
            to="/cards-sent"
            className="text-sm font-semibold text-poke-blue hover:underline"
          >
            Full feed →
          </Link>
        </div>
        <div className="mt-5 grid gap-3">
          {feed.map((p) => (
            <div key={p.sig} className="dex-card flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
                <img
                  src={spriteUrl(p.pokemonId || 25)}
                  alt=""
                  className="h-11 w-11 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <strong>{p.card}</strong> <span className="text-muted-foreground">· {p.set}</span>
                </p>
                <p className="mono-num mt-0.5 text-xs text-muted-foreground">
                  {p.grader} {p.grade} · ${p.coinTicker} · {p.ago}
                </p>
              </div>
              <span className="mono-num text-xs text-muted-foreground">
                ${p.price} → {p.destination === "vault" ? "vault" : p.to}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="mt-16 dex-card p-6">
        <h2 className="font-display text-3xl font-bold">Why this is real buy pressure on cards</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
          <li>
            <strong className="text-foreground">One-way.</strong> Vault cards can never be sold —
            the vault has no private key. Holder cards go to collectors' own wallets.
          </li>
          <li>
            <strong className="text-foreground">Persistent.</strong> Every trade tops up the pot,
            before and after graduation.
          </li>
          <li>
            <strong className="text-foreground">It sweeps the floor.</strong> The engine always
            buys the cheapest listed match, pointing a whole fee stream at the bottom of one thin
            slice.
          </li>
          <li>
            <strong className="text-foreground">It never chases.</strong> It pays the asking
            price: never more than $100 a card, never more than 3× insured value.
          </li>
        </ul>
        <p className="mono-num mt-5 text-xs text-muted-foreground">
          for scale, {MARKET.asOf}: ~{MARKET.listed.toLocaleString()} Pokémon cards listed on
          Collector Crypt, ~{MARKET.under100.toLocaleString()} of them at $100 or less, cheapest $
          {MARKET.cheapest.toFixed(2)}
        </p>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-3xl bg-poke-yellow px-8 py-14 text-center text-poke-navy shadow-md">
        <h2 className="font-display text-4xl font-bold">Launch a coin. Pick your Pokémon.</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm opacity-80">
          Every trade after that buys the real thing.
        </p>
        <Link to="/launch" className="poke-btn poke-btn-navy mt-7 inline-block">
          Start
        </Link>
      </section>
    </main>
  );
}
