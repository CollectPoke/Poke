import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CardWithPeople } from "@/lib/cards";

import { NftCard } from "./NftCard";

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
    const timer = window.setTimeout(() => setRevealed(true), 250);
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
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/95 px-5 py-8 backdrop-blur ${revealed ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
    >
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Purchase confirmed</p>
        <div className="mx-auto my-5 w-[min(74vw,280px)]">
          <NftCard card={card} />
        </div>
        <h2 id="purchase-reveal-title" className="font-display text-3xl font-extrabold text-foreground">
          {card.name} is yours
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">The 1/1 NFT has been added to your collection.</p>
        <div className="mt-5 flex flex-col items-stretch gap-2">
          <Button onClick={onClose} className="h-12 rounded-full bg-brand font-display font-bold text-brand-foreground hover:bg-brand/90">
            View my NFT
          </Button>
          <Button asChild variant="ghost">
            <a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noreferrer">
              View payment on Solscan ↗
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}