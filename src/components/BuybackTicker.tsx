import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { buybackTotals, countdownLabel, nextRunAt } from "@/lib/buybacks";

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

/** Dex-style live strip: what the fees did, and when the next buyback fires. */
export function BuybackTicker({ withCta = false }: { withCta?: boolean }) {
  const left = useCountdown();
  const { data: totals } = useQuery({
    queryKey: ["buyback-totals"],
    queryFn: buybackTotals,
    refetchInterval: 30_000,
  });

  const seconds = left === null ? null : Math.max(0, Math.floor(left / 1000));
  const urgent = seconds !== null && seconds <= 60;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-poke-navy text-white shadow-card">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 px-5 py-3">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-poke-green">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-poke-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-poke-green" />
          </span>
          Live
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
          Fee engine · 100% → $POKE buyback
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        <Cell
          label="Next buyback"
          value={seconds === null ? "--:--" : countdownLabel(seconds * 1000)}
          accent={urgent ? "text-poke-yellow" : undefined}
        />
        <Cell label="SOL collected" value={(totals?.sol ?? 0).toFixed(3)} />
        <Cell
          label="$POKE bought back"
          value={(totals?.poke ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        />
        <Cell label="Runs on-chain" value={(totals?.runs ?? 0).toLocaleString()} />
      </div>

      <div className="px-5 py-4">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full bg-poke-green" />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-widest">
          <span className="text-poke-green">100% buys back $POKE</span>
          <span className="text-white/45">0% team · 0% treasury · 0% skim</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/60">
          No 70/15/10/5 split to remember — there is one number. Every run is timed on a fixed
          10-minute clock (nobody picks the moment) and lands on-chain with a Solscan link, so you
          can verify the amount and the timing yourself instead of trusting a dashboard.
        </p>
        {withCta && (
          <Link
            to="/buyback"
            className="mt-4 inline-flex rounded-full bg-poke-yellow px-4 py-2 text-xs font-bold uppercase tracking-widest text-poke-yellow-foreground transition-transform hover:scale-[1.03]"
          >
            Verify every run →
          </Link>
        )}
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: string | undefined }) {
  return (
    <div className="bg-poke-navy px-5 py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</p>
      <p className={`mono-num mt-1 text-2xl font-bold tabular-nums ${accent ?? ""}`}>{value}</p>
    </div>
  );
}
