import { supabase } from "@/integrations/supabase/client";
import type { CardWithPeople } from "@/lib/cards";

const CARD_SELECT =
  "*, owner:profiles!cards_owner_id_fkey(username), creator:profiles!cards_creator_id_fkey(username)";

export async function listCards(opts?: {
  forSaleOnly?: boolean;
  limit?: number;
  sort?: "newest" | "priciest";
}) {
  let q = supabase
    .from("cards")
    .select(CARD_SELECT)
    .eq("status", "minted");
  q =
    opts?.sort === "priciest"
      ? q
          .order("list_price", { ascending: false, nullsFirst: false })
          .order("last_price", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
      : q.order("created_at", { ascending: false });
  if (opts?.forSaleOnly) q = q.not("list_price", "is", null);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as CardWithPeople[];
}

export async function getCard(id: string) {
  const { data, error } = await supabase
    .from("cards")
    .select(CARD_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as CardWithPeople | null) ?? null;
}

export type CardEvent = {
  id: string;
  kind: string;
  price: number | null;
  created_at: string;
  tx_signature: string | null;
  actor: { username: string } | null;
  counterparty: { username: string } | null;
};

export async function getCardEvents(cardId: string): Promise<CardEvent[]> {
  // card_events is locked to trade participants; public history comes from
  // the server with usernames only (no user IDs).
  const { getCardEventsPublic } = await import("@/lib/card-events.functions");
  const rows = await getCardEventsPublic({ data: { cardId } });
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    price: r.price,
    created_at: r.created_at,
    tx_signature: r.tx_signature,
    actor: r.actor ? { username: r.actor } : null,
    counterparty: r.counterparty ? { username: r.counterparty } : null,
  }));
}

export async function myCards(userId: string) {
  const { data, error } = await supabase
    .from("cards")
    .select(CARD_SELECT)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CardWithPeople[];
}

/** Every card this user minted, whether they still own it or not. */
export async function myMintedCards(userId: string) {
  const { data, error } = await supabase
    .from("cards")
    .select(CARD_SELECT)
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CardWithPeople[];
}

export type SaleEvent = {
  id: string;
  kind: string;
  price: number | null;
  created_at: string;
  tx_signature: string | null;
  actor_id: string | null;
  counterparty_id: string | null;
  card: { id: string; name: string; ticker: string; image_url: string | null } | null;
  actor: { username: string } | null;
  counterparty: { username: string } | null;
};

/** Sales where the user was the buyer or the seller. */
export async function mySaleHistory(userId: string) {
  const { data, error } = await supabase
    .from("card_events")
    .select(
      "id, kind, price, created_at, tx_signature, actor_id, counterparty_id, card:cards(id, name, ticker, image_url), actor:profiles!card_events_actor_id_fkey(username), counterparty:profiles!card_events_counterparty_id_fkey(username)",
    )
    .eq("kind", "sale")
    .or(`actor_id.eq.${userId},counterparty_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SaleEvent[];
}

export type CardOffer = {
  id: string;
  card_id: string;
  buyer_id: string;
  price: number;
  message: string | null;
  status: string;
  created_at: string;
  buyer: { username: string } | null;
  card: { id: string; name: string; ticker: string; image_url: string | null } | null;
};

const OFFER_SELECT =
  "id, card_id, buyer_id, price, message, status, created_at, buyer:profiles!card_offers_buyer_id_fkey(username), card:cards(id, name, ticker, image_url)";

/** Open offers on one card (visible to the card's owner and to each buyer). */
export async function offersForCard(cardId: string) {
  const { data, error } = await supabase
    .from("card_offers")
    .select(OFFER_SELECT)
    .eq("card_id", cardId)
    .eq("status", "pending")
    .order("price", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CardOffer[];
}

/** Every open offer sitting on cards this user owns. */
export async function offersOnMyCards() {
  const { data, error } = await supabase
    .from("card_offers")
    .select(OFFER_SELECT)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CardOffer[];
}

/** Offers this user has sent. */
export async function myOffers(userId: string) {
  const { data, error } = await supabase
    .from("card_offers")
    .select(OFFER_SELECT)
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CardOffer[];
}

/** True when the name is still free (no active card holds it). */
export async function isNameAvailable(name: string) {
  const key = name.trim().toLowerCase();
  if (!key) return false;
  const { data, error } = await supabase
    .from("cards")
    .select("id")
    .eq("name_key", key)
    .eq("status", "minted")
    .maybeSingle();
  if (error) throw error;
  return !data;
}
