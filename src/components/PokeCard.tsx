import { shortAddress, type CardWithPeople } from "@/lib/cards";

type Props = {
  card: CardWithPeople;
  compact?: boolean;
};

export function PokeCard({ card, compact = false }: Props) {
  const burned = card.status === "burned";

  return (
    <div
      className={[
        "holo-sheen relative flex flex-col rounded-2xl border-4 bg-gradient-to-b from-poke-yellow to-[oklch(0.8_0.16_75)] p-1.5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover",
        burned ? "border-poke-navy/30 opacity-70" : "border-poke-yellow",
      ].join(" ")}
    >
      <div className="flex h-full flex-col rounded-xl bg-card p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold leading-tight">{card.name}</h3>
            <span className="mono-num text-[11px] uppercase tracking-widest text-muted-foreground">
              ${card.ticker}
            </span>
          </div>
        </div>

        {/* Art */}
        <div
          className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-lg border border-poke-navy/10 bg-secondary"
        >
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={card.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-5xl font-bold text-poke-navy/30">
                {card.name.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          {burned && (
            <span className="absolute right-2 top-2 rounded-full bg-poke-navy px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Burned
            </span>
          )}
        </div>

        {/* Body */}
        {!compact && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {card.description || "No description."}
          </p>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between gap-2 border-t border-dashed border-poke-navy/15 pt-2 text-[11px]">
            <span className="truncate text-muted-foreground">
              held by <span className="font-semibold text-foreground">{card.owner?.username ?? "—"}</span>
            </span>
            {card.list_price !== null && !burned ? (
              <span className="mono-num shrink-0 rounded-full bg-poke-green px-2 py-0.5 font-bold text-white">
                {card.list_price} SOL
              </span>
            ) : (
              <span className="shrink-0 text-muted-foreground">not listed</span>
            )}
          </div>
          {card.list_price !== null && !burned && (
            <div className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-poke-green px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-poke-green/90 sm:text-base">
              <span>Buy for {card.list_price} SOL</span>
            </div>
          )}

          {/* Contract address, always at the bottom of the card */}
          <div className="mt-1.5 rounded-md bg-poke-navy px-2 py-1">
            <span className="mono-num block truncate text-[10px] tracking-tight text-poke-yellow">
              CA {shortAddress(card.contract_address, 8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
