import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { BuybackTicker } from "@/components/BuybackTicker";
import { useEffect, useState } from "react";

import {
  BUYBACK_INTERVAL_MS,
  SOLSCAN_TX,
  buybackTotals,
  countdownLabel,
  listBuybacks,
  nextRunAt,
  shortSig,
} from "@/lib/buybacks";

export const Route = createFileRoute("/buyback")({
  head: () => ({
    meta: [
      { title: "Buybacks · Poke" },
      {
        name: "description",
        content:
          "100% of the fees from every coin launched on Poke buy back $POKE. Every 10 minutes, with the Solscan transaction for each run.",
      },
      { property: "og:title", content: "Poke buybacks · every 10 minutes" },
      {
        property: "og:description",
        content: "100% of launch fees buy back $POKE every 10 minutes. Every run has a Solscan link.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuybackPage,
});

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(nextRunAt() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

function BuybackPage() {
  const left = useCountdown();
  const { data: runs, isLoading } = useQuery({
    queryKey: ["buybacks"],
    queryFn: () => listBuybacks(50),
    refetchInterval: 60_000,
  });
  const { data: totals } = useQuery({
    queryKey: ["buyback-totals"],
    queryFn: buybackTotals,
    refetchInterval: 60_000,
  });

  return (
    <main>
      <section className="bg-poke-navy">
        <div className="mx-auto max-w-6xl px-5 py-14 text-white">
          <span className="inline-block rounded-full bg-poke-yellow px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-poke-navy">
            100% of fees · every 10 minutes
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Every fee buys back $POKE.
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">
            Every coin launched on Poke pays fees, and 100% of them go one place: buying $POKE on
            the open market. It runs every 10 minutes, and every single run is posted here with its
            Solscan transaction so you can check it yourself.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <Stat label="Next buyback in" value={left === null ? "--:--" : countdownLabel(left)} highlight />
            <Stat label="Buybacks run" value={(totals?.runs ?? 0).toLocaleString()} />
            <Stat
              label="SOL spent"
              value={(totals?.sol ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 })}
            />
            <Stat
              label="$POKE bought"
              value={(totals?.poke ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-10">
        <BuybackTicker />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card color="bg-poke-yellow text-poke-navy" title="100% of fees">
            Nothing is skimmed. Every fee a Poke coin generates is used to buy $POKE.
          </Card>
          <Card color="bg-poke-blue text-white" title="Every 10 minutes">
            The buyback runs on a {BUYBACK_INTERVAL_MS / 60000}-minute clock, not whenever someone
            feels like it.
          </Card>
          <Card color="bg-poke-green text-white" title="Solscan proof">
            Each run links straight to its transaction on Solscan. No screenshots, no trust needed.
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="font-display text-3xl font-bold">Buyback log</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr] gap-3 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Time</span>
            <span className="text-right">SOL in</span>
            <span className="text-right">$POKE bought</span>
            <span className="text-right">Proof</span>
          </div>

          {isLoading ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (runs ?? []).length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-display text-xl font-bold">No buybacks yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                The first run posts here the moment coins launched on Poke start generating fees.
                Every entry will carry its Solscan link.
              </p>
            </div>
          ) : (
            (runs ?? []).map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr] items-center gap-3 border-b border-border/60 px-5 py-3 text-sm last:border-b-0"
              >
                <span className="mono-num text-muted-foreground">
                  {new Date(r.executed_at).toLocaleString()}
                </span>
                <span className="mono-num text-right">{Number(r.sol_spent).toFixed(3)}</span>
                <span className="mono-num text-right font-semibold">
                  {Number(r.poke_bought).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <a
                  href={SOLSCAN_TX(r.tx_signature)}
                  target="_blank"
                  rel="noreferrer"
                  className="mono-num text-right text-xs font-semibold text-poke-blue hover:underline"
                >
                  {shortSig(r.tx_signature)} ↗
                </a>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        highlight ? "bg-poke-yellow text-poke-navy" : "bg-white/10 text-white"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest opacity-75">{label}</p>
      <p className="mono-num mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Card({
  color,
  title,
  children,
}: {
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-5 shadow-card ${color}`}>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed opacity-90">{children}</p>
    </div>
  );
}
