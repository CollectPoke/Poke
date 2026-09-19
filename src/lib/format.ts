export function formatPrice(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1) return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  return `$${v.toPrecision(3)}`;
}

export function formatCompact(v: number | null): string {
  if (v === null) return "—";
  return `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(v)}`;
}

export function formatChange(v: number | null): string {
  if (v === null) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

/** Deterministic 0-100 style stats derived from live market data. */
export function stats(m: {
  marketCap: number | null;
  volume24h: number | null;
  change24h: number | null;
  price: number | null;
  high24h: number | null;
  low24h: number | null;
}) {
  const clamp = (n: number) => Math.max(4, Math.min(100, Math.round(n)));
  const logScale = (v: number | null, max: number) =>
    v && v > 0 ? clamp((Math.log10(v) / Math.log10(max)) * 100) : 4;

  const volatility =
    m.high24h && m.low24h && m.low24h > 0
      ? clamp(((m.high24h - m.low24h) / m.low24h) * 400)
      : 20;

  return {
    attack: clamp(50 + (m.change24h ?? 0) * 3),
    speed: logScale(m.volume24h, 1e10),
    volatility,
  };
}
