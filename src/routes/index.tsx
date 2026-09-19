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
      { title: "PokéPad · Launch a coin, every trade buys real Pokémon cards" },
      {
        name: "description",
        content:
          "PokéPad is a Solana launchpad where every coin is a real pump.fun coin paired with CARDS. A locked 1% fee buys real graded Pokémon cards and sends them to holders.",
      },
      {
        property: "og:title",
        content: "PokéPad · Launch a coin, every trade buys real Pokémon cards",
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
    <div className="dex-card p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mono-num mt-1 text-2xl">{value}</p>
    </div>
  );
}

function Home() {
  const topCoins = [...COINS].sort((a, b) => b.marketCap - a.marketCap).slice(0, 4);
  const feed = CARDS_SENT.slice(0, 5);

  return (
    <main className="mx-auto max-w-5xl px-5 pb-20">
      {/* Hero */}
      <section className="pt-16 pb-12">
        <p className="mono-num text-xs uppercase tracking-[0.22em] text-muted-foreground">
          a launchpad on solana · every coin is a real pump.fun coin
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
          Launch a coin, and every trade buys real Pokémon cards for its holders.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground">
          Each coin pays a 1% fee. The creator gets none of it — it is locked on chain at launch,
          forever. That fee buys real graded slabs and sends them to the wallets holding the coin.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/launch"
            className="rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Launch a coin
          </Link>
          <Link
            to="/coins"
            className="rounded-full border border-border px-6 py-3 text-sm transition-colors hover:bg-secondary"
          >
            Browse coins
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-4">
        <Stat label="Coins launched" value={SITE_STATS.coinsLaunched.toLocaleString()} />
        <Stat label="Cards sent" value={SITE_STATS.cardsSent.toLocaleString()} />
        <Stat label="Card value" value={`$${SITE_STATS.cardsValue.toLocaleString()}`} />
        <Stat label="$POKEPAD burned" value={`${SITE_STATS.burned}%`} />
      </section>

      {/* How it works */}
      <section className="mt-16">
        <h2 className="font-display text-3xl">How it works</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            [
              "1 · Launch on pump.fun",
              "Same bonding curve, same graduation to PumpSwap. The only difference is the pair: your coin trades against CARDS, Collector Crypt's token, instead of SOL.",
            ],
            [
              "2 · Pick what it collects",
              "Pikachu only, Charizard only, 10s only, or the whole binder. Plus a grade floor. Permanent — you cannot raise on Charizards and switch to commons.",
            ],
            [
              "3 · The fee locks itself",
              "The 1% creator fee is locked with pump.fun's own fee-sharing config and the admin key is thrown away in the same transaction. Nobody can repoint it. Not you, not us.",
            ],
            [
              "4 · The engine runs",
              "Round the clock: claim fees → swap to USDC → buy the cheapest matching card → send it to the holder who is owed the most.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="dex-card p-5">
              <p className="mono-num text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {title}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Split */}
      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="dex-card p-6">
          <h2 className="font-display text-3xl">Where the fee goes</h2>
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
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-foreground transition-all"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="dex-card p-6">
            <h3 className="font-display text-2xl">Holders do nothing</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No claiming, no forms, no staking. Hold at least {(MIN_HOLD / 1e6).toFixed(0)}M coins
              (0.1% of supply) and cards land in the same wallet. Credit is the smaller of your
              balance at the last look and at this one, so buying a minute before a round earns
              nothing from it. No raffle, no random draw — every coin's page shows the queue.
            </p>
          </div>
          <div className="dex-card p-6">
            <h3 className="font-display text-2xl">The burn</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              20% of every coin's fee buys $POKEPAD on the open market and burns it, the same round,
              from one wallet that belongs to the site itself. {SITE_STATS.burns} burns so far ·
              latest {SITE_STATS.lastBurnSig}.
            </p>
          </div>
        </div>
      </section>

      {/* Coins */}
      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">Coins collecting right now</h2>
          <Link to="/coins" className="text-sm text-muted-foreground hover:text-foreground">
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
          <h2 className="font-display text-3xl">Cards sent</h2>
          <Link to="/cards-sent" className="text-sm text-muted-foreground hover:text-foreground">
            Full feed →
          </Link>
        </div>
        <div className="mt-5 grid gap-3">
          {feed.map((p) => (
            <div key={p.sig} className="dex-card flex flex-wrap items-center gap-4 p-4">
              <img src={spriteUrl(p.pokemonId || 25)} alt="" className="h-12 w-12 object-contain" />
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
        <h2 className="font-display text-3xl">Why this is real buy pressure on cards</h2>
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
            <strong className="text-foreground">It sweeps the floor.</strong> The engine always buys
            the cheapest listed match, pointing a whole fee stream at the bottom of one thin slice.
          </li>
          <li>
            <strong className="text-foreground">It never chases.</strong> It pays the asking price:
            never more than $100 a card, never more than 3× insured value.
          </li>
        </ul>
        <p className="mono-num mt-5 text-xs text-muted-foreground">
          for scale, {MARKET.asOf}: ~{MARKET.listed.toLocaleString()} Pokémon cards listed on
          Collector Crypt, ~{MARKET.under100.toLocaleString()} of them at $100 or less, cheapest $
          {MARKET.cheapest.toFixed(2)}
        </p>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-3xl bg-foreground px-8 py-14 text-center text-background">
        <h2 className="font-display text-4xl">Launch a coin. Pick your Pokémon.</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm opacity-80">
          Every trade after that buys the real thing.
        </p>
        <Link
          to="/launch"
          className="mt-7 inline-block rounded-full bg-background px-6 py-3 text-sm text-foreground transition-opacity hover:opacity-90"
        >
          Start
        </Link>
      </section>
    </main>
  );
}
