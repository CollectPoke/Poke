import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Flat mandatory launch fee — covers the launch, network + Pump.fun fees.
export const LAUNCH_FEE_LAMPORTS = 100_000_000;

// Pump.fun's indexer fetches the metadata URI from the public internet, so it
// can never point at a dev/preview origin or the coin launches with no image.
export const PUBLIC_ORIGIN = "https://collectpoke.fun";

const launchSchema = z.object({
  name: z.string().trim().min(1).max(32),
  ticker: z.string().trim().min(1).max(10).regex(/^[A-Za-z0-9]+$/),
  description: z.string().trim().max(600),
  imageUrl: z.string().trim().regex(/^\/api\/public\/artwork\/[0-9a-f-]{36}$/i),
  listPrice: z.number().positive().max(1_000_000).nullable(),
  devBuySol: z.number().min(0).max(0).default(0),
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
      signatureOutcome,
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

    // Pump.fun rejects launches with a zero (or dust) first buy, so send a
    // ~$0.10 dev buy (0.001 SOL). It is covered by the flat 0.1 SOL fee.
    const devBuyLamports = 1_000_000; // 0.001 SOL ≈ ten cents
    const budgetLamports = LAUNCH_FEE_LAMPORTS;
    const requiredSol = budgetLamports / 1_000_000_000;

    const wallet = await getOrCreateWallet(context.userId);
    const balance = await getBalanceSol(wallet.public_key);
    if (balance < requiredSol) {
      throw new Error(
        `You need at least ${requiredSol.toFixed(3)} SOL in your Poke wallet. Current balance: ${balance.toFixed(4)} SOL.`,
      );
    }

    const origin = PUBLIC_ORIGIN;
    let launch = await supabaseAdmin
      .from("coin_launches")
      .select("id, creator_id, mint_address, tx_signature, status")
      .eq("name_key", nameKey)
      .eq("status", "pending")
      .maybeSingle();
    if (launch.error) throw launch.error;
    if (launch.data && launch.data.creator_id !== context.userId) {
      throw new Error(`"${name}" is already being launched by another collector.`);
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
          launch_budget_sol: requiredSol,
          initial_buy_sol: devBuyLamports / 1_000_000_000,
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
            solLamports: String(devBuyLamports),
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
        if (Number(built.solLamports) !== devBuyLamports) {
          throw new Error("Pump.fun returned an unexpected launch amount. No SOL was spent.");
        }
        mintAddress = built.mintPublicKey;
        signature = await signSimulateAndSendTransaction(
          wallet,
          built.transaction,
          budgetLamports,
          async (preparedSignature) => {
            const saved = await supabaseAdmin
              .from("coin_launches")
              .update({ mint_address: mintAddress, tx_signature: preparedSignature })
              .eq("id", launchId);
            if (saved.error) throw saved.error;
            signature = preparedSignature;
            transactionSent = true;
          },
        );
      }

      if (!signature || !mintAddress) {
        throw new Error("The launch receipt is incomplete. No card was created.");
      }
      await confirmSignature(signature);
      const existingCard = await supabaseAdmin
        .from("cards")
        .select("*")
        .eq("launch_id", launchId)
        .maybeSingle();
      if (existingCard.error) throw existingCard.error;
      if (existingCard.data) {
        await supabaseAdmin
          .from("coin_launches")
          .update({ status: "launched", error_message: null })
          .eq("id", launchId);
        return { card: existingCard.data, signature, mintAddress };
      }
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
          mint_price: requiredSol,
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
      let message = error instanceof Error ? error.message : "The launch failed.";

      // Nothing was ever broadcast -> no SOL left the wallet. Release the name.
      if (!transactionSent || !signature) {
        await supabaseAdmin
          .from("coin_launches")
          .update({ status: "failed", error_message: `${message} No SOL was taken from your wallet.` })
          .eq("id", launchId);
        throw new Error(`${message} No SOL was taken from your wallet.`);
      }

      // Something was broadcast: find out whether it actually cost the user anything.
      const outcome = await signatureOutcome(signature);
      if (outcome === "dropped" || outcome === "reverted") {
        // The chain never took the money (a reverted tx only burns the ~0.000005 SOL
        // network fee). Clear the receipt so the name and the retry are both clean.
        await supabaseAdmin
          .from("coin_launches")
          .update({
            status: "failed",
            mint_address: null,
            tx_signature: null,
            error_message: `${message} The launch never went through, so your SOL is still in your wallet.`,
          })
          .eq("id", launchId);
        throw new Error(
          `${message} The launch didn't go through, so your SOL is still in your wallet. You can try again.`,
        );
      }

      if (outcome === "landed") {
        message =
          "Your coin launched on Solana but the NFT wasn't finished. Hit mint again with the same name to finish it — you won't be charged twice.";
      }
      await supabaseAdmin
        .from("coin_launches")
        .update({ error_message: message })
        .eq("id", launchId);
      throw new Error(message);
    }
  });