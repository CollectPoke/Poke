import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { BuybackTicker } from "@/components/BuybackTicker";
import { useAuth } from "@/lib/auth";
import type { CardWithPeople } from "@/lib/cards";
import { listCards } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JPEG · One jpeg, one coin, forever" },
      {
        name: "description",
        content:
          "Mint your jpeg as a one-of-one NFT with a real Pump.fun coin attached. Buy, sell, mint and burn.",
      },
      { property: "og:title", content: "JPEG · One jpeg, one coin, forever" },
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

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Home() {
  const { user } = useAuth();
  const { data: cards } = useQuery({
    queryKey: ["cards"],
    queryFn: () => listCards(),
  });

  const feed = cards ?? [];

  return (
    <main className="mx-auto grid max-w-6xl gap-0 px-0 sm:px-5 lg:grid-cols-[minmax(0,600px)_320px] lg:justify-center lg:gap-8">
      {/* ─── Feed column ─── */}
      <section className="min-h-screen border-x border-border">
        {/* sticky feed header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <h1 className="text-lg font-extrabold tracking-tight">Home</h1>
        </div>

        {/* composer */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-poke-yellow/15 text-lg">
              🐷
            </div>
            <div className="min-w-0 flex-1">
              <p className="py-2 text-lg text-muted-foreground">
                Got a jpeg? Give it a coin.
              </p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  1/1 NFT · real Pump.fun coin · 0.1 SOL flat
                </p>
                <Link
                  to="/mint"
                  className="poke-btn shrink-0 !px-5 !py-1.5 text-sm"
                >
                  Mint
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* feed */}
        {feed.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-xl font-extrabold">Nothing minted yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Every name is still up for grabs. The first jpeg writes history.
            </p>
            <Link to="/mint" className="poke-btn mt-6 inline-flex">
              Mint the first NFT
            </Link>
          </div>
        ) : (
          <ul>
            {feed.map((card) => (
              <FeedPost key={card.id} card={card} />
            ))}
          </ul>
        )}

        {feed.length > 0 && (
          <div className="border-t border-border px-4 py-4 text-center">
            <Link to="/cards" className="text-sm font-semibold text-poke-yellow hover:underline">
              Show every NFT →
            </Link>
          </div>
        )}
      </section>

      {/* ─── Right rail ─── */}
      <aside className="hidden lg:block">
        <div className="sticky top-4 space-y-4 py-4">
          <BuybackTicker />

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-base font-extrabold">How JPEG works</h2>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li><span className="font-bold text-foreground">Claim a name.</span> If it's taken, it's gone forever — one of each, ever.</li>
              <li><span className="font-bold text-foreground">Mint the NFT.</span> Your jpeg + ticker + a real coin on Pump.fun.</li>
              <li><span className="font-bold text-foreground">Trade it.</span> List it, get offers, sell instantly.</li>
              <li><span className="font-bold text-foreground">Or burn it.</span> The name frees up for someone else.</li>
            </ul>
            <Link
              to="/docs"
              className="mt-4 inline-block text-sm font-semibold text-poke-yellow hover:underline"
            >
              Read the how-to →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-base font-extrabold">100% of fees buy back $POKE</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every 10 minutes, on-chain, with a Solscan link for every run. 0% team.
            </p>
            <Link
              to="/buyback"
              className="mt-3 inline-block text-sm font-semibold text-poke-yellow hover:underline"
            >
              Verify the log →
            </Link>
          </div>

          {!user && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="text-base font-extrabold">New here?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                One account = one wallet. No seed phrases, no extensions.
              </p>
              <Link to="/auth" className="poke-btn mt-4 inline-flex w-full justify-center">
                Create account
              </Link>
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}

function FeedPost({ card }: { card: CardWithPeople }) {
  const listed = card.list_price !== null;
  const burned = card.status === "burned";
  const owner = card.owner?.username ?? "collector";

  return (
    <li className="border-b border-border transition-colors hover:bg-foreground/[0.02]">
      <Link
        to="/card/$cardId"
        params={{ cardId: card.id }}
        className="flex gap-3 px-4 py-3"
      >
        {/* art */}
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {card.image_url ? (
            <img src={card.image_url} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-xl">🐷</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* header row */}
          <div className="flex items-baseline gap-1.5 text-[15px]">
            <span className="truncate font-bold">{card.name}</span>
            <span className="mono-num shrink-0 text-sm text-muted-foreground">
              ${card.ticker}
            </span>
            <span className="shrink-0 text-sm text-muted-foreground">
              · {timeAgo(card.created_at)}
            </span>
            {burned && (
              <span className="ml-auto shrink-0 rounded-full bg-poke-red/10 px-2 py-0.5 text-[11px] font-bold text-poke-red">
                Burned
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">@{owner}</p>

          {card.description && (
            <p className="mt-1 line-clamp-2 text-[15px] leading-snug">{card.description}</p>
          )}

          {/* action row */}
          <div className="mt-2 flex items-center gap-2">
            <span className="mono-num rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
              1/1
            </span>
            {listed && !burned ? (
              <span className="rounded-full bg-poke-yellow px-3.5 py-1 text-xs font-bold text-poke-yellow-foreground">
                Buy · {card.list_price} SOL
              </span>
            ) : (
              <span className="rounded-full border border-border px-3.5 py-1 text-xs font-semibold text-muted-foreground">
                {burned ? "Retired" : "Not for sale"}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
