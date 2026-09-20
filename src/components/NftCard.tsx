import { shortAddress, type CardWithPeople } from "@/lib/cards";

type Props = {
  card: CardWithPeople;
  compact?: boolean;
};

export function NftCard({ card, compact = false }: Props) {
  const burned = card.status === "burned";

  return (
    <div
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        burned ? "border-border opacity-60" : "border-border hover:border-brand/60",
      ].join(" ")}
    >
      {/* Art — square, edge to edge */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-6xl text-muted-foreground/40">
              {card.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}

        <span className="mono-num absolute left-2 top-2 rounded-lg border border-foreground/10 bg-background/90 px-2 py-1 text-[10px] font-bold text-foreground backdrop-blur">
          1 / 1
        </span>
        {burned && (
          <span className="absolute right-2 top-2 rounded bg-danger px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Burned
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-base font-black leading-tight tracking-normal">
            {card.name}
          </h3>
          <span className="mono-num shrink-0 text-[11px] font-bold uppercase tracking-widest text-brand">
            ${card.ticker}
          </span>
        </div>

        {!compact && card.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {card.description}
          </p>
        )}

        <div className="mt-auto space-y-2 pt-1">
          <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-[11px]">
            <span className="truncate text-muted-foreground">
              held by{" "}
              <span className="font-semibold text-foreground">{card.owner?.username ?? "—"}</span>
            </span>
            {card.list_price !== null && !burned ? (
              <span className="mono-num shrink-0 font-bold text-success">
                {card.list_price} SOL
              </span>
            ) : (
              <span className="shrink-0 text-muted-foreground/70">unlisted</span>
            )}
          </div>

          {card.list_price !== null && !burned && (
            <div className="w-full rounded-2xl bg-foreground px-4 py-3 text-center text-sm font-extrabold text-background">Acquire · {card.list_price} SOL</div>
          )}

          <div className="mono-num truncate text-[10px] tracking-tight text-muted-foreground/70">
            CA {shortAddress(card.contract_address, 8)}
          </div>
        </div>
      </div>
    </div>
  );
}
