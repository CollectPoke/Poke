import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { BoosterPack } from "@/components/BoosterPack";
import { PokeCard } from "@/components/PokeCard";
import { listCards } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Poke · One name, one card, forever" },
      {
        name: "description",
        content:
          "Launch a coin on Poke and it becomes a one-of-one trading card. Only one Dog can ever exist. Buy, sell, mint and burn.",
      },
      { property: "og:title", content: "Poke · One name, one card, forever" },
      {
        property: "og:description",
        content:
          "Launch a coin on Poke and it becomes a one-of-one trading card. Only one Dog can ever exist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ART = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// floating booster packs around the hero, each with a Pokémon on the wrapper
const PACKS = [
  { id: 25, left: "20%", top: "4%", width: "w-20 md:w-24", tilt: "-10deg" },
  { id: 6, right: "30%", top: "8%", width: "w-16 md:w-20", tilt: "8deg" },
  { id: 150, right: "3%", bottom: "6%", width: "w-20 md:w-28", tilt: "-4deg" },
  { id: 94, left: "4%", bottom: "10%", width: "w-14 md:w-20", tilt: "6deg" },
  { id: 143, left: "56%", top: "-4%", width: "w-14 md:w-20", tilt: "-8deg" },
];

function Home() {
  const { data: cards } = useQuery({
    queryKey: ["cards"],
    queryFn: () => listCards({ limit: 8 }),
  });

  const latest = cards ?? [];
  const forSale = latest.filter((c) => c.list_price !== null);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-poke-blue">
        {/* floating booster packs with Pokémon on the wrapper */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
          {PACKS.map((p, i) => (
            <div
              key={p.id}
              className="absolute"
              style={{ left: p.left, right: p.right, top: p.top, bottom: p.bottom }}
            >
              <BoosterPack
                label="Series 01"
                delay={i * 1.1}
                tilt={p.tilt}
                art={ART(p.id)}
                className={`${p.width} opacity-95`}
              />
            </div>
          ))}
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:grid-cols-[1.1fr_1fr]">
          <div className="text-white">
            <span className="inline-block rounded-full bg-poke-yellow px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-poke-navy">
              One name, one card, forever
            </span>
            <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] drop-shadow sm:text-6xl">
              Launch your coin as a card nobody can copy.
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/85">
              Every coin launched on Poke comes out as a trading card, with its contract address
              printed at the bottom. Only one "Dog" can ever exist. Mint it, hold it, sell it — or
              burn it and set the name free.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/mint" className="poke-btn">
                Mint a card
              </Link>
              <Link
                to="/cards"
                className="rounded-full border-2 border-white/60 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Browse all cards
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[300px] rotate-[-3deg]">
            {latest[0] ? (
              <Link to="/card/$cardId" params={{ cardId: latest[0].id }}>
                <PokeCard card={latest[0]} />
              </Link>
            ) : (
              <div className="rounded-2xl border-4 border-poke-yellow bg-card/95 p-8 text-center">
                <p className="font-display text-xl font-bold">No cards minted yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The first name is still up for grabs.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-3xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile color="bg-poke-yellow text-poke-navy" step="01" title="Claim the name">
            Pick a name and ticker. If it's taken, it's gone — the site refuses a second one.
          </Tile>
          <Tile color="bg-poke-blue text-white" step="02" title="Mint the card">
            Your coin prints as a card with its image, ticker and contract address.
          </Tile>
          <Tile color="bg-poke-green text-white" step="03" title="Trade it">
            List it for sale, and anyone with an account can buy it. Ownership moves instantly.
          </Tile>
          <Tile color="bg-poke-purple text-white" step="04" title="Or burn it">
            Burning retires the card and releases the name for someone else to claim.
          </Tile>
        </div>
      </section>

      {/* Buybacks */}
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="overflow-hidden rounded-2xl bg-poke-navy text-white shadow-card">
          <div className="grid gap-6 p-7 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <span className="inline-block rounded-full bg-poke-yellow px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-poke-navy">
                100% of fees
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold">
                Every fee buys back $POKE — every 10 minutes.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/80">
                Coins launched on Poke pay fees, and all of it goes into buying $POKE on the open
                market. Every run is posted with its Solscan transaction, so you can check it
                yourself.
              </p>
              <Link to="/buyback" className="poke-btn mt-5 inline-flex">
                See the buyback log
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniStat label="Of fees used" value="100%" />
              <MiniStat label="Buyback runs" value="Every 10 min" />
              <MiniStat label="Proof" value="Solscan" />
              <MiniStat label="Kept by us" value="0%" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest cards */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold">Freshly minted</h2>
          <Link to="/cards" className="text-sm font-semibold text-poke-blue hover:underline">
            See all →
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-xl font-bold">Nothing minted yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every name is still available. Claim one.
            </p>
            <Link to="/mint" className="poke-btn mt-5 inline-flex">
              Mint the first card
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((card) => (
              <Link key={card.id} to="/card/$cardId" params={{ cardId: card.id }}>
                <PokeCard card={card} compact />
              </Link>
            ))}
          </div>
        )}

        {forSale.length > 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{forSale.length}</span> of these are
            listed for sale right now.
          </p>
        )}
      </section>
    </main>
  );
}

function Tile({
  color,
  step,
  title,
  children,
}: {
  color: string;
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-5 shadow-card ${color}`}>
      <span className="mono-num text-xs font-bold opacity-70">{step}</span>
      <h3 className="mt-1 font-display text-xl font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed opacity-90">{children}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</p>
      <p className="mono-num mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}
