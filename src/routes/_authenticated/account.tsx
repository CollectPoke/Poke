import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { NftCard } from "@/components/NftCard";
import { WalletPanel } from "@/components/WalletPanel";
import { SaleCelebration } from "@/components/SaleCelebration";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { myCards, mySaleHistory } from "@/lib/queries";
import { formatSolAmount } from "@/lib/cards";
const SOLSCAN_TX = (signature: string) => `https://solscan.io/tx/${signature}`;

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My collection · JPEG" },
      { name: "description", content: "The one-of-one JPEG NFTs you own." },
      { property: "og:title", content: "My collection · JPEG" },
      { property: "og:description", content: "The one-of-one JPEG NFTs you own." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, username } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";

  const { data: cards, isLoading } = useQuery({
    queryKey: ["my-cards", userId],
    queryFn: () => myCards(userId),
    enabled: !!userId,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const owned = cards ?? [];
  const listed = owned.filter((c) => c.list_price !== null && c.status === "minted");

  const { data: sales } = useQuery({
    queryKey: ["my-sales", userId],
    queryFn: () => mySaleHistory(userId),
    enabled: !!userId,
  });
  const history = useMemo(() => sales ?? [], [sales]);
  const [tab, setTab] = useState<"owned" | "listed" | "history">("owned");
  const [saleToCelebrate, setSaleToCelebrate] = useState<(typeof history)[number] | null>(null);

  useEffect(() => {
    const latestSale = history.find(
      (event) => event.counterparty_id === userId && event.tx_signature && event.card,
    );
    if (!latestSale || !latestSale.tx_signature) return;
    const seenKey = `jpeg-sale-seen:${latestSale.id}`;
    if (window.localStorage.getItem(seenKey)) return;
    window.localStorage.setItem(seenKey, "1");
    setSaleToCelebrate(latestSale);
  }, [history, userId]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      {/* Collector card */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_10px_40px_-15px_oklch(0.24_0.045_260/0.25)] sm:p-8">
        <div className="pointer-events-none absolute -right-32 -top-32 size-64 rounded-full bg-brand/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-48 rounded-full bg-link/10" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="grid size-20 place-items-center rounded-full bg-brand text-3xl font-black text-brand-foreground shadow-lg sm:size-24">
                {(username ?? "J").slice(0, 1).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-card bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-foreground shadow-sm">
                Collector
              </span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
                {username ?? "…"}
              </h1>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/mint" className="primary-btn">
              Mint an NFT
            </Link>
            <button
              onClick={signOut}
              className="rounded-xl border-2 border-border bg-card px-5 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat
            label="NFTs owned"
            value={owned.length}
            className="border-link/25 bg-link/10"
            labelClass="text-foreground"
            valueClass="text-link"
          />
          <Stat
            label="Listed for sale"
            value={listed.length}
            className="border-brand/40 bg-brand/15"
            labelClass="text-muted-foreground"
            valueClass="text-foreground"
          />
          <Stat
            label="Minted by you"
            value={owned.filter((c) => c.creator_id === userId).length}
            className="border-danger/20 bg-danger/10"
            labelClass="text-danger"
            valueClass="text-danger"
          />
        </div>
      </section>

      <WalletPanel />

      {/* Binder */}
      <div className="mt-10 flex items-center gap-4">
        <h2 className="font-display text-2xl font-bold text-foreground">My collection</h2>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-8 rounded-full bg-brand" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
        </div>
        <div className="h-px flex-1 rounded-full bg-border" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Tab active={tab === "owned"} onClick={() => setTab("owned")}>
          Owned ({owned.length})
        </Tab>
        <Tab active={tab === "listed"} onClick={() => setTab("listed")}>
          Listed ({listed.length})
        </Tab>
        <Tab active={tab === "history"} onClick={() => setTab("history")}>
          Sale history ({history.length})
        </Tab>
        <Link
          to="/gallery"
          className="ml-auto rounded-full border-2 border-border bg-card px-3.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
        >
          Open my gallery →
        </Link>
      </div>

      {tab === "history" ? (
        history.length === 0 ? (
          <EmptyBox
            title="No sales yet"
            text="Once you buy or sell an NFT, every sale shows up here with its Solana receipt."
          />
        ) : (
          <ul className="mt-6 space-y-3">
            {history.map((ev) => {
              const sold = ev.counterparty_id === userId;
              return (
                <li
                  key={ev.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      sold ? "bg-danger/15 text-danger" : "bg-success/15 text-foreground"
                    }`}
                  >
                    {sold ? "Sold" : "Bought"}
                  </span>
                  <div className="min-w-0 flex-1">
                    {ev.card ? (
                      <Link
                        to="/card/$cardId"
                        params={{ cardId: ev.card.id }}
                        className="font-display text-lg font-bold text-foreground hover:underline"
                      >
                        {ev.card.name}{" "}
                        <span className="text-muted-foreground">${ev.card.ticker}</span>
                      </Link>
                    ) : (
                      <span className="font-bold text-muted-foreground">NFT removed</span>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(ev.created_at).toLocaleString()} ·{" "}
                      {sold
                        ? `to ${ev.actor?.username ?? "someone"}`
                        : `from ${ev.counterparty?.username ?? "someone"}`}
                    </p>
                  </div>
                  <span className="mono-num font-display text-lg font-bold text-foreground">
                    {ev.price !== null ? `${formatSolAmount(ev.price)} SOL` : "—"}
                  </span>
                  {ev.tx_signature && (
                    <a
                      href={SOLSCAN_TX(ev.tx_signature)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-link underline"
                    >
                      Solscan
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )
      ) : isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading your NFTs…</p>
      ) : (tab === "owned" ? owned : listed).length === 0 ? (
        tab === "listed" ? (
          <EmptyBox
            title="Nothing listed"
            text="Open any card you own and set a price to put it on the market."
          />
        ) : (
          <div className="mt-4 rounded-3xl border-2 border-dashed border-ink/20 bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-link/10">
              <span className="text-2xl font-black text-brand">J</span>
            </div>
            <p className="font-display text-xl font-bold text-foreground">
              Your collection is empty
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Every great collector starts somewhere. Mint the first NFT of a name, or buy one from
              the market.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to="/mint" className="primary-btn">
                Mint an NFT
              </Link>
              <Link
                to="/cards"
                className="rounded-xl border-2 border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
              >
                Browse the market
              </Link>
            </div>
          </div>
        )
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(tab === "owned" ? owned : listed).map((card) => (
            <Link
              key={card.id}
              to="/card/$cardId"
              params={{ cardId: card.id }}
              className="transition-transform duration-300 hover:-translate-y-2"
            >
              <NftCard card={card} />
            </Link>
          ))}
        </div>
      )}
      {saleToCelebrate?.card && saleToCelebrate.tx_signature ? (
        <SaleCelebration
          cardName={saleToCelebrate.card.name}
          ticker={saleToCelebrate.card.ticker}
          imageUrl={saleToCelebrate.card.image_url}
          price={saleToCelebrate.price}
          buyer={saleToCelebrate.actor?.username ?? "a new collector"}
          signature={saleToCelebrate.tx_signature}
          onClose={() => setSaleToCelebrate(null)}
        />
      ) : null}
    </main>
  );
}

function Stat({
  label,
  value,
  className,
  labelClass,
  valueClass,
}: {
  label: string;
  value: number;
  className?: string;
  labelClass?: string;
  valueClass?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-transform hover:-translate-y-1 ${className ?? ""}`}
    >
      <p className={`text-xs font-bold uppercase tracking-widest ${labelClass ?? ""}`}>{label}</p>
      <p className={`mono-num mt-1 font-display text-3xl font-bold ${valueClass ?? ""}`}>{value}</p>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "border-ink bg-border text-brand"
          : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-4 rounded-3xl border-2 border-dashed border-ink/20 bg-card p-12 text-center">
      <p className="font-display text-xl font-bold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
