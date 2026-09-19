import { createServerFn } from "@tanstack/react-start";
import { CATALOG } from "./catalog";

export type Market = {
  id: string;
  price: number | null;
  change24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  rank: number | null;
  high24h: number | null;
  low24h: number | null;
  ath: number | null;
};

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

export const getMarkets = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ markets: Market[]; error: string | null }> => {
    const ids = CATALOG.map((c) => c.id).join(",");
    const url =
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}` +
      `&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;

    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) return { markets: [], error: "Live prices are unavailable right now." };
      const raw = (await res.json()) as Array<Record<string, unknown>>;
      const markets: Market[] = raw.map((r) => ({
        id: String(r["id"]),
        price: num(r["current_price"]),
        change24h: num(r["price_change_percentage_24h"]),
        marketCap: num(r["market_cap"]),
        volume24h: num(r["total_volume"]),
        rank: num(r["market_cap_rank"]),
        high24h: num(r["high_24h"]),
        low24h: num(r["low_24h"]),
        ath: num(r["ath"]),
      }));
      return { markets, error: null };
    } catch {
      return { markets: [], error: "Live prices are unavailable right now." };
    }
  },
);
