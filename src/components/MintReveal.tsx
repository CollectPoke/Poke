import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import type { CardWithPeople } from "@/lib/cards";
import { PokeCard } from "./PokeCard";

export function MintReveal({ card, signature, onContinue }: { card: CardWithPeople; signature: string; onContinue: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="mint-reveal-title" className="mint-reveal fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-5 py-6">
      <div className="mint-energy-ring" />
      <div className="mint-energy-ring mint-energy-ring-two" />
      <div className="relative flex h-[min(800px,95dvh)] w-full max-w-sm flex-col items-center justify-center text-center">
        <p className="mint-reveal-kicker font-display text-sm font-bold uppercase tracking-[0.2em] text-poke-yellow">Pump.fun launch confirmed</p>
        <h2 id="mint-reveal-title" className="mint-reveal-title mt-1 font-display text-4xl font-extrabold text-primary-foreground">A new original!</h2>
        <div className="mint-reveal-card my-5 w-[min(72vw,280px)]"><PokeCard card={card} /></div>
        <div className="mint-reveal-copy">
          <p className="font-display text-2xl font-extrabold text-primary-foreground">{card.name} is one of one</p>
          <p className="mt-1 text-sm text-primary-foreground/65">${card.ticker} is live on Solana and you claimed its one-of-one Poke card.</p>
          <a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noreferrer" className="mt-3 block text-xs font-semibold text-poke-yellow underline underline-offset-4">View launch on Solscan ↗</a>
          <Button onClick={onContinue} className="mt-5 h-12 w-full rounded-full bg-poke-yellow font-display font-bold text-poke-yellow-foreground hover:bg-poke-yellow/90">See my new card</Button>
        </div>
      </div>
    </div>
  );
}