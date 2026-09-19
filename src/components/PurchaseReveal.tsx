import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CardWithPeople } from "@/lib/cards";

import { PokeCard } from "./PokeCard";

type Props = {
  card: CardWithPeople;
  signature: string;
  onClose: () => void;
};

export function PurchaseReveal({ card, signature, onClose }: Props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => setRevealed(true), 1750);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-reveal-title"
      className={`purchase-reveal fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-5 py-6 ${revealed ? "is-revealed" : ""}`}
    >
      <div className="purchase-reveal-glow" />
      <div className="purchase-spark purchase-spark-one" />
      <div className="purchase-spark purchase-spark-two" />
      <div className="purchase-spark purchase-spark-three" />

      <div className="relative flex h-[min(780px,94dvh)] w-full max-w-sm flex-col items-center justify-center">
        <p className="purchase-opening-label absolute top-2 font-display text-sm font-bold uppercase tracking-[0.22em] text-poke-yellow">
          Opening your Poke pack…
        </p>

        <div className="purchase-card-stage absolute top-14 z-20 w-[min(74vw,280px)]">
          <PokeCard card={card} />
        </div>

        <div className="purchase-pack-flap purchase-pack-flap-left" />
        <div className="purchase-pack-flap purchase-pack-flap-right" />
        <div className="purchase-pack absolute top-[43%] z-30 flex h-64 w-[min(82vw,310px)] flex-col items-center justify-end overflow-hidden rounded-b-2xl border-x-4 border-b-4 border-poke-blue/40 pb-8 shadow-2xl">
          <div className="purchase-pack-lines absolute inset-0" />
          <img src="/favicon.png" alt="" className="relative mb-3 size-14" />
          <span className="relative text-xs font-bold uppercase tracking-[0.28em] text-primary-foreground/60">
            One of one
          </span>
          <strong className="relative font-display text-3xl font-extrabold uppercase text-primary-foreground">
            Poke <span className="text-poke-yellow">Pack</span>
          </strong>
        </div>

        <div className="purchase-result absolute inset-x-0 bottom-0 z-40 text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-poke-yellow">
            Added to your binder
          </p>
          <h2 id="purchase-reveal-title" className="mt-1 font-display text-3xl font-extrabold text-primary-foreground">
            You caught {card.name}!
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/65">${card.ticker} now belongs to you.</p>
          <div className="mt-4 flex flex-col items-stretch gap-2">
            <Button onClick={onClose} className="h-12 rounded-full bg-poke-yellow font-display font-bold text-poke-yellow-foreground hover:bg-poke-yellow/90">
              View my card
            </Button>
            <Button asChild variant="ghost" className="text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noreferrer">
                View payment on Solscan ↗
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}