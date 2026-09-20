import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { BuybackTicker } from "@/components/BuybackTicker";
import { PokeCard } from "@/components/PokeCard";
import { listCards } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Poke · One jpeg, one coin, forever" },
      {
        name: "description",
        content:
          "Mint your jpeg as a one-of-one NFT with a real Pump.fun coin attached. Buy, sell, mint and burn.",
      },
      { property: "og:title", content: "Poke · One jpeg, one coin, forever" },
      {
        property: "og:description",
        content:
          "Mint your jpeg as a one-of-one NFT with a real Pump.fun coin attached.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

// the hero shows at most this many cards; the rest live under "Freshly minted"
const HERO_CARD_COUNT = 10;

function Home() {
  const { data: cards } = useQuery({
    queryKey: ["cards"],
    queryFn: () => listCards(),
  });

  const latest = cards ?? [];
  const heroCards = latest.slice(0, HERO_CARD_COUNT);
  const restCards = latest.slice(HERO_CARD_COUNT);
  const forSale = latest.filter((c) => c.list_price !== null);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-poke-yellow/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-[420px] rounded-full bg-poke-purple/10 blur-[140px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-[1fr_1.05fr]">
          <div>
            <span className="mono-num inline-block border border-poke-yellow/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-poke-yellow">
              1 jpeg / 1 coin / forever
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[0.92] sm:text-7xl">
              Mint the
              <br />
              <span className="text-poke-yellow">jpeg.</span> Launch
              <br />
              the coin.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Upload an image, pick a name and a ticker. Poke mints it as a one-of-one and launches
              a real coin for it on Pump.fun, with the contract address printed on the piece. Only
              one of each name can ever exist — hold it, sell it, or burn it and set the name free.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/mint" className="poke-btn">
                Mint an NFT
              </Link>
              <Link to="/cards" className="poke-btn poke-btn-navy">
                Browse all NFTs
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[560px]">
            {heroCards.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {heroCards.map((card) => (
                  <Link key={card.id} to="/card/$cardId" params={{ cardId: card.id }}>
                    <PokeCard card={card} compact />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-md border border-dashed border-border bg-card/60">
                <div className="px-8 text-center">
                  <p className="mono-num text-[11px] uppercase tracking-[0.3em] text-poke-yellow">
                    Empty gallery
                  </p>
                  <p className="mt-3 font-display text-2xl">No NFTs minted yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The first name is still up for grabs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-3xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile color="bg-poke-yellow text-poke-yellow-foreground" step="01" title="Claim the name">
            Pick a name and ticker. If it's taken, it's gone — the site refuses a second one.
          </Tile>
          <Tile color="bg-poke-blue text-white" step="02" title="Mint the NFT">
            Your jpeg becomes a one-of-one NFT with its ticker and coin address on it.
          </Tile>
          <Tile color="bg-poke-green text-white" step="03" title="Trade it">
            List it for sale, and anyone with an account can buy it. Ownership moves instantly.
          </Tile>
          <Tile color="bg-poke-purple text-white" step="04" title="Or burn it">
            Burning retires the NFT and releases the name for someone else to claim.
          </Tile>
        </div>
      </section>

      {/* Buybacks */}
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="overflow-hidden rounded-2xl bg-poke-navy text-white shadow-card">
          <div className="grid gap-6 p-7 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <span className="inline-block rounded-full bg-poke-yellow px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-poke-yellow-foreground">
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
            <BuybackTicker />
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
              Mint the first NFT
            </Link>
          </div>
        ) : restCards.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {restCards.map((card) => (
              <Link key={card.id} to="/card/$cardId" params={{ cardId: card.id }}>
                <PokeCard card={card} compact />
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            The newest 10 are up in the hero — <Link to="/cards" className="font-semibold text-poke-blue hover:underline">see every NFT →</Link>
          </p>
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
