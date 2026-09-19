import { getRequest } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LAUNCH_BUDGET_LAMPORTS = 100_000_000;
const INITIAL_BUY_LAMPORTS = 75_000_000;

const launchSchema = z.object({
  name: z.string().trim().min(1).max(32),
  ticker: z.string().trim().min(1).max(10).regex(/^[A-Za-z0-9]+$/),
  description: z.string().trim().max(600),
  imageUrl: z.string().trim().regex(/^\/api\/public\/artwork\/[0-9a-f-]{36}$/i),
  listPrice: z.number().positive().max(1_000_000).nullable(),
});

export const launchCoinAndMintCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => launchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const {
      confirmSignature,
      getBalanceSol,
      getOrCreateSystemWallet,
      getOrCreateWallet,
      signSimulateAndSendTransaction,
    } = await import("@/lib/wallet.server");

    const name = data.name.trim();
    const nameKey = name.toLowerCase();
    const ticker = data.ticker.trim().toUpperCase();
    const artworkId = data.imageUrl.split("/").at(-1);
    if (!artworkId) throw new Error("Upload an image before launching.");

    const artwork = await supabaseAdmin
      .from("artwork")
      .select("id")
      .eq("id", artworkId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (artwork.error || !artwork.data) throw new Error("That image is not available to this account.");

    const activeCard = await supabaseAdmin
      .from("cards")
      .select("id")
      .eq("name_key", nameKey)
      .eq("status", "minted")
      .maybeSingle();
    if (activeCard.data) throw new Error(`"${name}" has already been launched on Poke.`);

    const wallet = await getOrCreateWallet(context.userId);
    const balance = await getBalanceSol(wallet.public_key);
    if (balance < 0.1) {
      throw new Error(`You need at least 0.1 SOL in your Poke wallet. Current balance: ${balance.toFixed(4)} SOL.`);
    }

    const request = getRequest();
    const origin = new URL(request.url).origin;
    let launch = await supabaseAdmin
      .from("coin_launches")
      .select("id, creator_id, mint_address, tx_signature, status")
      .eq("name_key", nameKey)
      .eq("status", "pending")
      .maybeSingle();
    if (launch.error) throw launch.error;
    if (launch.data && launch.data.creator_id !== context.userId) {
      throw new Error(`"${name}" is already being launched by another trainer.`);
    }

    if (!launch.data) {
      const launchId = crypto.randomUUID();
      const metadataUrl = `${origin}/api/public/coin-metadata/${launchId}`;
      const inserted = await supabaseAdmin
        .from("coin_launches")
        .insert({
          id: launchId,
          creator_id: context.userId,
          name,
          name_key: nameKey,
          ticker,
          description: data.description || null,
          image_url: data.imageUrl,
          metadata_url: metadataUrl,
          launch_budget_sol: 0.1,
          initial_buy_sol: INITIAL_BUY_LAMPORTS / 1_000_000_000,
          status: "pending",
        })
        .select("id, creator_id, mint_address, tx_signature, status")
        .single();
      if (inserted.error) {
        if (inserted.error.code === "23505") throw new Error(`"${name}" is already being launched.`);
        throw inserted.error;
      }
      launch = inserted;
    }

    const launchRow = launch.data;
    if (!launchRow) throw new Error("Could not reserve this coin name.");
    const launchId = launchRow.id;
    let mintAddress = launchRow.mint_address;
    let signature = launchRow.tx_signature;
    let transactionSent = Boolean(signature);

    try {
      if (!signature || !mintAddress) {
        const creatorWallet = await getOrCreateSystemWallet("creator_buyback");
        const response = await fetch("https://fun-block.pump.fun/agents/create-coin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: wallet.public_key,
            feePayer: wallet.public_key,
            creator: creatorWallet.public_key,
            name,
            symbol: ticker,
            uri: `${origin}/api/public/coin-metadata/${launchId}`,
            solLamports: String(INITIAL_BUY_LAMPORTS),
            mayhemMode: false,
            cashback: false,
            tokenizedAgent: false,
            frontRunningProtection: false,
            tipAmount: 0,
            encoding: "base64",
          }),
        });
        if (!response.ok) throw new Error("Pump.fun could not prepare this launch. No SOL was spent.");
        const built = z.object({
          transaction: z.string().min(100),
          mintPublicKey: z.string().min(32).max(50),
          solLamports: z.union([z.string(), z.number()]),
        }).parse(await response.json());
        if (Number(built.solLamports) !== INITIAL_BUY_LAMPORTS) {
          throw new Error("Pump.fun returned an unexpected launch amount. No SOL was spent.");
        }
        mintAddress = built.mintPublicKey;
        signature = await signSimulateAndSendTransaction(wallet, built.transaction, LAUNCH_BUDGET_LAMPORTS);
        transactionSent = true;
        const saved = await supabaseAdmin
          .from("coin_launches")
          .update({ mint_address: mintAddress, tx_signature: signature })
          .eq("id", launchId);
        if (saved.error) throw saved.error;
      }

      await confirmSignature(signature);
      const card = await supabaseAdmin
        .from("cards")
        .insert({
          name,
          name_key: nameKey,
          ticker,
          description: data.description || null,
          image_url: data.imageUrl,
          contract_address: mintAddress,
          creator_id: context.userId,
          owner_id: context.userId,
          list_price: data.listPrice,
          launch_id: launchId,
          launch_tx_signature: signature,
          mint_price: 0.1,
        })
        .select("*")
        .single();
      if (card.error) throw card.error;
      const completed = await supabaseAdmin
        .from("coin_launches")
        .update({ status: "launched", error_message: null })
        .eq("id", launchId);
      if (completed.error) throw completed.error;
      return { card: card.data, signature, mintAddress };
    } catch (error) {
      const message = error instanceof Error ? error.message : "The launch failed.";
      await supabaseAdmin
        .from("coin_launches")
        .update(transactionSent ? { error_message: message } : { status: "failed", error_message: message })
        .eq("id", launchId);
      throw new Error(message);
    }
  });