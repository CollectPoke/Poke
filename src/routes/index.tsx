import pigAsset from "@/assets/pig.webp.asset.json";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coins, ImagePlus, Sparkles, WalletCards } from "lucide-react";

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

  const latest = feed.slice(0, 8);
  const featured = latest[0];

  return (
    <main className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <section className="grid gap-5 lg:grid-cols-12">
        <div className="arena-panel arena-enter relative overflow-hidden bg-brand p-7 sm:p-9 lg:col-span-8 lg:min-h-[460px]">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-extrabold text-foreground">
              <Sparkles className="size-3.5 text-brand" /> Season 01 · Mint is live
            </span>
            <h1 className="mt-7 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Your JPEG is the main character.
            </h1>
            <p className="mt-5 max-w-lg text-base font-semibold leading-relaxed text-foreground/70 sm:text-lg">
              Create a one-of-one collectible, launch its coin, then collect and trade inside JPEG.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                to="/mint"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-4 text-sm font-extrabold text-background shadow-card transition-transform active:scale-95"
              >
                Start minting <ImagePlus className="size-4" />
              </Link>
              <Link
                to="/cards"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-foreground/15 bg-card/80 px-6 py-4 text-sm font-extrabold text-foreground transition-colors hover:bg-card"
              >
                Browse market <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 right-1 hidden h-[88%] w-[42%] rotate-3 overflow-hidden rounded-[2rem] border-8 border-card bg-card p-2 shadow-2xl sm:block">
            {featured?.image_url ? (
              <img
                src={featured.image_url}
                alt=""
                className="size-full rounded-[1.35rem] object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center rounded-[1.35rem] bg-secondary">
                <img src={pigAsset.url} alt="" className="w-3/4" />
              </div>
            )}
          </div>
        </div>

        <aside className="arena-panel p-6 lg:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-brand">PLAYER HUB</p>
              <h2 className="mt-1 text-2xl">{user ? "Welcome back" : "Ready player?"}</h2>
            </div>
            <div className="grid size-14 place-items-center rounded-2xl bg-secondary">
              <img src={pigAsset.url} alt="" className="size-11" />
            </div>
          </div>
          <div className="mt-7 grid gap-3">
            <DashboardStat icon={<ImagePlus />} label="Mint fee" value="0.1 SOL" />
            <DashboardStat icon={<WalletCards />} label="Edition" value="1 of 1" />
            <DashboardStat
              icon={<Coins />}
              label="Collectibles live"
              value={String(feed.length).padStart(2, "0")}
            />
          </div>
          <Link
            to={user ? "/account" : "/auth"}
            className="mt-6 flex w-full justify-center rounded-2xl bg-foreground px-5 py-4 text-sm font-extrabold text-background transition-transform active:scale-[0.98]"
          >
            {user ? "Open my player hub" : "Create player account"}
          </Link>
        </aside>
      </section>

      <section className="py-12">
        <div className="mb-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-brand">
              LIVE MARKETPLACE · {String(feed.length).padStart(2, "0")}
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl">New in the arcade</h2>
          </div>
          <Link
            to="/cards"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="arena-panel grid min-h-64 place-items-center px-6 text-center">
            <div>
              <img src={pigAsset.url} alt="" className="mx-auto size-20" />
              <h3 className="mt-3 text-2xl">The arcade is waiting</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Mint the first collectible and start the game.
              </p>
              <Link to="/mint" className="primary-btn mt-6 inline-flex">
                Mint first NFT
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((card) => (
              <FeedPost key={card.id} card={card} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function DashboardStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/60 p-4">
      <span className="grid size-11 place-items-center rounded-xl bg-card text-brand [&>svg]:size-5">
        {icon}
      </span>
      <div>
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-lg font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function FeedPost({ card }: { card: CardWithPeople }) {
  const listed = card.list_price !== null;
  const burned = card.status === "burned";
  const owner = card.owner?.username ?? "collector";

  return (
    <li className="group overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link to="/card/$cardId" params={{ cardId: card.id }} className="block">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
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
            <span className="truncate text-base font-extrabold">{card.name}</span>
            <span className="mono-num shrink-0 text-xs text-muted-foreground">${card.ticker}</span>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            @{owner} · {timeAgo(card.created_at)}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs font-bold text-muted-foreground">1 of 1</span>
            {listed && !burned ? (
              <span className="mono-num rounded-xl bg-foreground px-3 py-2 text-xs font-bold text-background">
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
