import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** A buyer asks the owner to sell at their own price. */
export const makeOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        cardId: z.string().uuid(),
        price: z.number().positive().max(10000),
        message: z.string().max(280).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: card, error } = await supabaseAdmin
      .from("cards")
      .select("id, owner_id, status")
      .eq("id", data.cardId)
      .maybeSingle();
    if (error) throw error;
    if (!card) throw new Error("Card not found");
    if (card.status !== "minted") throw new Error("This card has been burned");
    if (card.owner_id === context.userId) throw new Error("You already own this NFT");

    const { error: insErr } = await supabaseAdmin.from("card_offers").insert({
      card_id: data.cardId,
      buyer_id: context.userId,
      price: data.price,
      message: data.message ?? null,
    });
    if (insErr) {
      if (insErr.code === "23505") throw new Error("You already have an open offer on this NFT.");
      throw insErr;
    }
    return { ok: true };
  });

/** The buyer takes their own offer back. */
export const withdrawOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ offerId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("card_offers")
      .update({ status: "withdrawn" })
      .eq("id", data.offerId)
      .eq("buyer_id", context.userId)
      .eq("status", "pending");
    if (error) throw error;
    return { ok: true };
  });

/** The NFT owner turns an offer down. */
export const declineOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ offerId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: offer, error } = await supabaseAdmin
      .from("card_offers")
      .select("id, status, card:cards(owner_id)")
      .eq("id", data.offerId)
      .maybeSingle();
    if (error) throw error;
    if (!offer) throw new Error("Offer not found");
    const ownerId = (offer.card as unknown as { owner_id: string } | null)?.owner_id;
    if (ownerId !== context.userId) throw new Error("This offer isn't on an NFT you own");
    if (offer.status !== "pending") throw new Error("This offer is no longer open");

    const { error: upErr } = await supabaseAdmin
      .from("card_offers")
      .update({ status: "declined" })
      .eq("id", data.offerId);
    if (upErr) throw upErr;
    return { ok: true };
  });

/**
 * The NFT owner accepts an offer: the buyer's SOL is checked and moved to the
 * owner's wallet, then the NFT changes hands.
 */
export const acceptOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ offerId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { getOrCreateWallet, getBalanceSol, sendSol } = await import("./wallet.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: offer, error } = await supabaseAdmin
      .from("card_offers")
      .select("id, status, price, buyer_id, card_id, card:cards(id, owner_id, status)")
      .eq("id", data.offerId)
      .maybeSingle();
    if (error) throw error;
    if (!offer) throw new Error("Offer not found");
    const card = offer.card as unknown as { id: string; owner_id: string; status: string } | null;
    if (!card) throw new Error("Card not found");
    if (card.owner_id !== context.userId) throw new Error("This offer isn't on an NFT you own");
    if (card.status !== "minted") throw new Error("This card has been burned");
    if (offer.status !== "pending") throw new Error("This offer is no longer open");

    const price = Number(offer.price);
    const buyerWallet = await getOrCreateWallet(offer.buyer_id);
    const sellerWallet = await getOrCreateWallet(context.userId);

    const balance = await getBalanceSol(buyerWallet.public_key);
    if (balance === null) throw new Error("Couldn't reach the chain — try again in a moment.");
    if (balance < price + 0.001) {
      throw new Error(
        `The buyer no longer has enough SOL (${balance.toFixed(4)} of ${price} SOL). The offer stays open.`,
      );
    }

    const signature = await sendSol(buyerWallet, sellerWallet.public_key, price);

    const { error: upErr } = await supabaseAdmin
      .from("cards")
      .update({ owner_id: offer.buyer_id, list_price: null, last_price: price })
      .eq("id", card.id);
    if (upErr) {
      throw new Error(
        `Payment sent (${signature}) but the NFT didn't change hands: ${upErr.message}. Keep this signature.`,
      );
    }

    await supabaseAdmin.from("card_events").insert({
      card_id: card.id,
      kind: "sale",
      actor_id: offer.buyer_id,
      counterparty_id: context.userId,
      price,
      tx_signature: signature,
    });

    await supabaseAdmin.from("card_offers").update({ status: "accepted" }).eq("id", offer.id);
    // Every other open offer on this NFT is now moot.
    await supabaseAdmin
      .from("card_offers")
      .update({ status: "declined" })
      .eq("card_id", card.id)
      .eq("status", "pending");

    return { signature, price };
  });
