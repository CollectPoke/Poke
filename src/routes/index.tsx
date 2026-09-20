import pigAsset from "@/assets/pig.webp.asset.json";
import arenaImage from "@/assets/jpeg-arena.jpg";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

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
        content: "Mint your jpeg as a one-of-one NFT with a real Pump.fun coin attached.",
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

  const latest = feed.slice(0, 6);

  return (
    <main>
      <section className="arena-stage relative overflow-hidden border-b border-border">
        <img
          src={arenaImage}
          alt=""
          width={1920}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/60" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
          <div className="arena-enter max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="size-2 animate-pulse bg-brand" />
              <span className="hud-label text-brand">Launch arena online</span>
              <span className="h-px w-16 bg-brand/50" />
            </div>
            <h1 className="text-4xl font-black uppercase leading-[0.92] tracking-normal sm:text-5xl lg:text-6xl">
              Mint the artifact.
              <br />
              <span className="text-brand">Launch its coin.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/70">
              Every JPEG is a one-of-one digital collectible with its own live coin. Claim the name,
              own the original, trade the signal.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/mint" className="primary-btn !px-7 !py-3.5">
                Initialize mint
              </Link>
              <Link
                to="/cards"
                className="secondary-btn hud-label inline-flex items-center px-7 py-3.5"
              >
                Enter market
              </Link>
            </div>
            <div className="mt-9 grid max-w-xl grid-cols-3 border border-border bg-background/60 backdrop-blur-sm">
              <HudStat label="Mint fee" value="0.1 SOL" />
              <HudStat label="Edition" value="1 / 1" />
              <HudStat label="Network" value="SOL" />
            </div>
          </div>

          <aside className="arena-panel arena-enter p-5 [animation-delay:180ms]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="hud-label text-brand">Player terminal</p>
                <h2 className="mt-1 text-lg uppercase tracking-normal">
                  {user ? "Access granted" : "Ready to deploy?"}
                </h2>
              </div>
              <img src={pigAsset.url} alt="" className="size-11 object-contain" />
            </div>
            <div className="space-y-4 py-5 text-sm text-muted-foreground">
              <TerminalStep number="01" text="Upload one original JPEG" />
              <TerminalStep number="02" text="Claim its permanent name" />
              <TerminalStep number="03" text="Launch the NFT and coin" />
              <TerminalStep number="04" text="List, collect, trade or burn" />
            </div>
            <Link
              to={user ? "/account" : "/auth"}
              className="secondary-btn hud-label flex w-full justify-center px-5 py-3"
            >
              {user ? "Open account" : "Create player account"}
            </Link>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="hud-label text-brand">
              Live registry // {String(feed.length).padStart(3, "0")}
            </p>
            <h2 className="mt-2 text-3xl uppercase tracking-normal sm:text-4xl">
              Latest artifacts
            </h2>
          </div>
          <Link
            to="/cards"
            className="hud-label text-muted-foreground transition-colors hover:text-brand"
          >
            View all →
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="arena-panel grid min-h-64 place-items-center px-6 text-center">
            <div>
              <p className="hud-label text-brand">Registry empty</p>
              <h3 className="mt-3 text-2xl uppercase tracking-normal">
                The first name is still unclaimed
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Deploy the first artifact into the arena.
              </p>
              <Link to="/mint" className="primary-btn mt-6 inline-flex">
                Mint first NFT
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((card) => (
              <FeedPost key={card.id} card={card} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-border px-3 py-4 last:border-r-0 sm:px-5">
      <p className="hud-label text-muted-foreground">{label}</p>
      <p className="mono-num mt-1 text-base font-bold sm:text-lg">{value}</p>
    </div>
  );
}

function TerminalStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="mono-num text-xs text-brand">{number}</span>
      <span className="h-px w-5 bg-border" />
      <span>{text}</span>
    </div>
  );
}

function FeedPost({ card }: { card: CardWithPeople }) {
  const listed = card.list_price !== null;
  const burned = card.status === "burned";
  const owner = card.owner?.username ?? "collector";

  return (
    <li className="bg-background transition-colors hover:bg-card">
      <Link to="/card/$cardId" params={{ cardId: card.id }} className="block p-4">
        <div className="relative aspect-square w-full overflow-hidden border border-border bg-muted">
          {card.image_url ? (
            <img src={card.image_url} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center">
              <img src={pigAsset.url} alt="" className="size-20" />
            </div>
          )}
          {burned && (
            <span className="hud-label absolute left-0 top-0 bg-danger px-2 py-1 text-[10px] text-background">
              Burned
            </span>
          )}
        </div>

        <div className="mt-4 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-base font-black uppercase">{card.name}</span>
            <span className="mono-num shrink-0 text-xs text-muted-foreground">${card.ticker}</span>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            @{owner} · {timeAgo(card.created_at)}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="hud-label text-muted-foreground">1 / 1</span>
            {listed && !burned ? (
              <span className="mono-num bg-brand px-3 py-1 text-xs font-bold text-brand-foreground">
                {card.list_price} SOL
              </span>
            ) : (
              <span className="hud-label text-muted-foreground">
                {burned ? "Retired" : "Not listed"}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
