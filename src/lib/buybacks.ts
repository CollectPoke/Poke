import { supabase } from "@/integrations/supabase/client";

export type Buyback = {
  id: string;
  tx_signature: string;
  sol_spent: number;
  poke_bought: number;
  executed_at: string;
};

/** Every 10 minutes, on the clock. */
export const BUYBACK_INTERVAL_MS = 10 * 60 * 1000;

export const SOLSCAN_TX = (sig: string) => `https://solscan.io/tx/${sig}`;

export function nextRunAt(now = Date.now()): number {
  return Math.ceil(now / BUYBACK_INTERVAL_MS) * BUYBACK_INTERVAL_MS;
}

export function countdownLabel(msLeft: number): string {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function shortSig(sig: string): string {
  return sig.length <= 16 ? sig : `${sig.slice(0, 8)}…${sig.slice(-8)}`;
}

export async function listBuybacks(limit = 50): Promise<Buyback[]> {
  const { data, error } = await supabase
    .from("buybacks")
    .select("id, tx_signature, sol_spent, poke_bought, executed_at")
    .order("executed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Buyback[];
}

export async function buybackTotals(): Promise<{
  runs: number;
  sol: number;
  poke: number;
}> {
  const { data, error } = await supabase.from("buybacks").select("sol_spent, poke_bought");
  if (error) throw error;
  const rows = data ?? [];
  return {
    runs: rows.length,
    sol: rows.reduce((a, r) => a + Number(r.sol_spent ?? 0), 0),
    poke: rows.reduce((a, r) => a + Number(r.poke_bought ?? 0), 0),
  };
}
