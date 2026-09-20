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

    const { data: card, error } = await supabaseAdmin
      .from("cards")
      .select("id, owner_id, list_price, status, name")
      .eq("id", data.cardId)
      .maybeSingle();
    if (error) throw error;
    if (!card) throw new Error("Card not found");
    if (card.status !== "minted") throw new Error("This card has been burned");
    if (!card.list_price) throw new Error("This card is not for sale");
    if (card.owner_id === context.userId) throw new Error("You already own this NFT");

    const buyerWallet = await getOrCreateWallet(context.userId);
    const { getOrCreateWallet: gw } = await import("./wallet.server");
    const sellerWallet = await gw(card.owner_id);

    const price = Number(card.list_price);
    const signature = await sendSol(buyerWallet, sellerWallet.public_key, price);

    const { error: rpcError } = await supabaseAdmin.rpc("buy_card", {
      _card_id: data.cardId,
      _buyer_id: context.userId,
    });
    if (rpcError) {
      throw new Error(
        `Payment sent (${signature}) but the transfer of ownership failed: ${rpcError.message}. Contact support with this signature.`,
      );
    }

    const { data: ev } = await supabaseAdmin
      .from("card_events")
      .select("id")
      .eq("card_id", data.cardId)
      .eq("kind", "sale")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ev)
      await supabaseAdmin.from("card_events").update({ tx_signature: signature }).eq("id", ev.id);

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
