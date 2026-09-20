import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { formatPokeCoin } from "@/lib/cards";

type Props = { cardName: string; ticker: string; imageUrl: string | null; price: number | null; buyer: string; signature: string; onClose: () => void };

export function SaleCelebration({ cardName, ticker, imageUrl, price, buyer, signature, onClose }: Props) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="sale-celebration-title" className="sale-celebration fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-5 py-6">
      {Array.from({ length: 10 }).map((_, index) => <i key={index} className={`sale-coin sale-coin-${index + 1}`}>◎</i>)}
      <div className="sale-celebration-panel relative w-full max-w-sm text-center">
        <div className="mx-auto size-28 overflow-hidden rounded-full border-4 border-poke-yellow bg-secondary shadow-2xl">
          {imageUrl ? <img src={imageUrl} alt={cardName} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center font-display text-4xl font-bold text-foreground">{cardName.slice(0, 1)}</span>}
        </div>
        <p className="mt-5 font-display text-sm font-bold uppercase tracking-[0.2em] text-poke-yellow">NFT sold!</p>
        <h2 id="sale-celebration-title" className="mt-1 font-display text-4xl font-extrabold text-primary-foreground">You made a sale</h2>
        <p className="mt-2 text-primary-foreground/70">{cardName} <span className="font-bold">${ticker}</span> found a new collector: {buyer}.</p>
        <div className="my-5 rounded-2xl border border-poke-yellow/35 bg-poke-yellow/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/55">Received</p>
          <p className="mono-num mt-1 font-display text-4xl font-extrabold text-poke-yellow">{price === null ? "—" : formatPokeCoin(price)} SOL</p>
          <p className="mt-1 text-xs text-primary-foreground/55">Sent directly to your JPEG wallet</p>
        </div>
        <Button onClick={onClose} className="h-12 w-full rounded-full bg-poke-yellow font-display font-bold text-poke-yellow-foreground hover:bg-poke-yellow/90">Collect & continue</Button>
        <Button asChild variant="ghost" className="mt-2 text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground"><a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noreferrer">View receipt on Solscan ↗</a></Button>
      </div>
    </div>
  );
}