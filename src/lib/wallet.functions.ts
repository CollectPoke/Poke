import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getOrCreateWallet, getBalanceSol, getRecentActivity } = await import("./wallet.server");
    const wallet = await getOrCreateWallet(context.userId);
    const [balance, activity] = await Promise.all([
      getBalanceSol(wallet.public_key),
      getRecentActivity(wallet.public_key),
    ]);
    return { address: wallet.public_key, balance, activity, checkedAt: Date.now() };
  });

export const exportMyPrivateKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getOrCreateWallet, decryptSecret } = await import("./wallet.server");
    const wallet = await getOrCreateWallet(context.userId);
    return { address: wallet.public_key, privateKey: decryptSecret(wallet.secret_ciphertext) };
  });

export const withdrawSol = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ to: z.string().min(32).max(44), amount: z.number().positive().max(1000) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getOrCreateWallet, sendSol } = await import("./wallet.server");
    const wallet = await getOrCreateWallet(context.userId);
    const signature = await sendSol(wallet, data.to, data.amount);
    return { signature };
  });

export const buyCardWithSol = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ cardId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { getOrCreateWallet, sendSol } = await import("./wallet.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const buyerWallet = await getOrCreateWallet(context.userId);
    const reservation = await supabaseAdmin.rpc("reserve_card_sale", {
      _card_id: data.cardId,
      _buyer_id: context.userId,
      _offer_id: undefined,
    });
    if (reservation.error) throw reservation.error;
    const reserved = reservation.data?.[0];
    if (!reserved) throw new Error("Could not reserve this NFT for purchase");

    const sellerWallet = await getOrCreateWallet(reserved.seller_id);
    const price = Number(reserved.price);
    let signature: string;
    try {
      signature = await sendSol(buyerWallet, sellerWallet.public_key, price);
    } catch (error) {
      await supabaseAdmin.rpc("release_card_sale", {
        _card_id: data.cardId,
        _buyer_id: context.userId,
      });
      throw error;
    }

    const completed = await supabaseAdmin.rpc("complete_card_sale", {
      _card_id: data.cardId,
      _buyer_id: context.userId,
      _tx_signature: signature,
    });
    if (completed.error) {
      throw new Error(
        `Payment sent (${signature}) but the transfer of ownership failed: ${completed.error.message}. Contact support with this signature.`,
      );
    }

    return { signature, price };
  });

export const burnCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ cardId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: card, error } = await supabaseAdmin
      .from("cards")
      .select("id, owner_id, status")
      .eq("id", data.cardId)
      .maybeSingle();
    if (error) throw error;
    if (!card) throw new Error("Card not found");
    if (card.owner_id !== context.userId) throw new Error("You do not own this NFT");
    if (card.status !== "minted") throw new Error("This card has already been burned");

    const { error: upErr } = await supabaseAdmin
      .from("cards")
      .update({ status: "burned", list_price: null })
      .eq("id", data.cardId);
    if (upErr) throw upErr;

    return { burned: true };
  });
