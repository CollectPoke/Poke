import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PublicCardEvent = {
  id: string;
  kind: string;
  price: number | null;
  created_at: string;
  tx_signature: string | null;
  actor: string | null;
  counterparty: string | null;
};

/**
 * Public per-card history. The card_events table is locked to trade
 * participants, so this runs server-side and returns only safe display
 * fields — no user IDs, just usernames.
 */
export const getCardEventsPublic = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ cardId: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<PublicCardEvent[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("card_events")
      .select(
        "id, kind, price, created_at, tx_signature, actor:profiles!card_events_actor_id_fkey(username), counterparty:profiles!card_events_counterparty_id_fkey(username)",
      )
      .eq("card_id", data.cardId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map((r) => ({
      id: r.id,
      kind: r.kind,
      price: r.price,
      created_at: r.created_at,
      tx_signature: r.tx_signature,
      actor: (r.actor as { username: string } | null)?.username ?? null,
      counterparty: (r.counterparty as { username: string } | null)?.username ?? null,
    }));
  });
