import { supabase } from "@/integrations/supabase/client";
import type { CardWithPeople } from "@/lib/cards";

const CARD_SELECT =
  "*, owner:profiles!cards_owner_id_fkey(username), creator:profiles!cards_creator_id_fkey(username)";

export async function listCards(opts?: { forSaleOnly?: boolean; limit?: number }) {
  let q = supabase
    .from("cards")
    .select(CARD_SELECT)
    .eq("status", "minted")
    .order("created_at", { ascending: false });
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

export async function getCardEvents(cardId: string) {
  const { data, error } = await supabase
    .from("card_events")
    .select("*, actor:profiles!card_events_actor_id_fkey(username)")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as {
    id: string;
    kind: string;
    price: number | null;
    created_at: string;
    actor: { username: string } | null;
  }[];
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
