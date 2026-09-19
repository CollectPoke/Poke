import nacl from "tweetnacl";
import bs58 from "bs58";
import {
  LAMPORTS_PER_SOL,
  RPC_URL,
  getBalanceSol,
  getOrCreateSystemWallet,
  secretKeyFrom,
  type SystemWalletRow,
} from "./wallet.server";

export const POKE_MINT = "HNPFcpRpPsDdVfx9Las1af3YYpFBq3T8wcEhgRfdpoke";
/** SOL kept in the buyback wallet so it can always pay network fees. */
const GAS_RESERVE_LAMPORTS = 3_000_000; // 0.003 SOL
/** Below this there is nothing worth swapping. */
const MIN_SWAP_LAMPORTS = 2_000_000; // 0.002 SOL

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

function readCompactLen(bytes: Uint8Array, offset: number): [number, number] {
  let value = 0;
  let shift = 0;
  let cursor = offset;
  while (cursor < bytes.length) {
    const byte = bytes[cursor];
    if (byte === undefined) break;
    cursor += 1;
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return [value, cursor];
    shift += 7;
    if (shift > 21) break;
  }
  throw new Error("Invalid Solana transaction encoding");
}

/** Signs an unsigned transaction built by a third party (Pump.fun / Jupiter) and broadcasts it. */
async function signAndSend(wallet: SystemWalletRow, raw: Uint8Array): Promise<string> {
  const [signatureCount, signaturesStart] = readCompactLen(raw, 0);
  const messageStart = signaturesStart + signatureCount * 64;
  if (signatureCount < 1 || messageStart >= raw.length) throw new Error("Invalid transaction");

  const message = raw.subarray(messageStart);
  let cursor = 0;
  if (((message[0] ?? 0) & 0x80) !== 0) cursor += 1;
  cursor += 3;
  const [keyCount, keysStart] = readCompactLen(message, cursor);
  const publicKey = bs58.decode(wallet.public_key);
  let signerIndex = -1;
  for (let index = 0; index < keyCount; index += 1) {
    const keyBytes = message.subarray(keysStart + index * 32, keysStart + (index + 1) * 32);
    if (keyBytes.length === 32 && keyBytes.every((byte, i) => byte === publicKey[i])) {
      signerIndex = index;
      break;
    }
  }
  if (signerIndex !== 0) throw new Error("The buyback wallet is not the fee payer of this transaction");

  const signed = raw.slice();
  const secret = secretKeyFrom({
    user_id: "system",
    public_key: wallet.public_key,
    secret_ciphertext: wallet.secret_ciphertext,
  });
  signed.set(nacl.sign.detached(message, secret), signaturesStart);

  const base64 = Buffer.from(signed).toString("base64");
  const signature = await rpc<string>("sendTransaction", [
    base64,
    { encoding: "base64", maxRetries: 3, preflightCommitment: "confirmed" },
  ]);

  for (let i = 0; i < 40; i += 1) {
    const status = await rpc<{ value: Array<{ confirmationStatus?: string; err?: unknown } | null> }>(
      "getSignatureStatuses",
      [[signature], { searchTransactionHistory: true }],
    );
    const s = status.value?.[0];
    if (s?.err) throw new Error("The transaction failed on Solana");
    if (s?.confirmationStatus === "confirmed" || s?.confirmationStatus === "finalized") break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return signature;
}

/** Claims every unclaimed Pump.fun creator fee for the coins launched through Poke. */
async function claimCreatorFees(wallet: SystemWalletRow): Promise<string | null> {
  const res = await fetch("https://pumpportal.fun/api/trade-local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: wallet.public_key,
      action: "collectCreatorFee",
      priorityFee: 0.000001,
    }),
  });
  if (!res.ok) return null;
  const raw = new Uint8Array(await res.arrayBuffer());
  if (raw.length < 100) return null;
  try {
    return await signAndSend(wallet, raw);
  } catch (error) {
    console.error("creator fee claim failed", error);
    return null;
  }
}

async function tokenDecimals(mint: string): Promise<number> {
  try {
    const r = await rpc<{ value: { decimals: number } }>("getTokenSupply", [mint]);
    return r.value.decimals ?? 6;
  } catch {
    return 6;
  }
}

/**
 * Claims the Pump.fun creator fees and sends the whole buyback-wallet balance
 * to an address (used when a buyback is not possible).
 */
export async function claimAndSweep(destination: string): Promise<{
  claimSignature: string | null;
  sweepSignature: string | null;
  solSent: number;
}> {
  const { sendSol } = await import("./wallet.server");
  const wallet = await getOrCreateSystemWallet("creator_buyback");
  const claimSignature = await claimCreatorFees(wallet);
  if (claimSignature) await new Promise((r) => setTimeout(r, 2000));

  const lamports = Math.round((await getBalanceSol(wallet.public_key)) * LAMPORTS_PER_SOL);
  const sendable = lamports - 10_000; // leave the network fee behind
  if (sendable <= 0) return { claimSignature, sweepSignature: null, solSent: 0 };

  const solSent = sendable / LAMPORTS_PER_SOL;
  const sweepSignature = await sendSol(
    {
      user_id: "system",
      public_key: wallet.public_key,
      secret_ciphertext: wallet.secret_ciphertext,
    },
    destination,
    solSent,
  );
  return { claimSignature, sweepSignature, solSent };
}

export type BuybackRunResult = {
  ok: boolean;
  claimSignature: string | null;
  swapSignature: string | null;
  solSpent: number;
  pokeBought: number;
  reason?: string;
};

/** Claims creator fees and spends 100% of them buying $POKE on the open market. */
export async function runBuyback(): Promise<BuybackRunResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const wallet = await getOrCreateSystemWallet("creator_buyback");

  const claimSignature = await claimCreatorFees(wallet);
  if (claimSignature) await new Promise((r) => setTimeout(r, 2000));

  const lamports = Math.round((await getBalanceSol(wallet.public_key)) * LAMPORTS_PER_SOL);
  const spendable = lamports - GAS_RESERVE_LAMPORTS;
  if (spendable < MIN_SWAP_LAMPORTS) {
    return {
      ok: true,
      claimSignature,
      swapSignature: null,
      solSpent: 0,
      pokeBought: 0,
      reason: "Not enough collected fees to buy back yet",
    };
  }

  const quoteRes = await fetch(
    `https://lite-api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${POKE_MINT}&amount=${spendable}&slippageBps=500`,
  );
  if (!quoteRes.ok) throw new Error("Could not price the $POKE buyback");
  const quote = (await quoteRes.json()) as { outAmount: string };

  const swapRes = await fetch("https://lite-api.jup.ag/swap/v1/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: wallet.public_key,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: { maxLamports: 200_000, priorityLevel: "medium" },
      },
    }),
  });
  if (!swapRes.ok) throw new Error("Could not build the $POKE buyback transaction");
  const swap = (await swapRes.json()) as { swapTransaction: string };
  const swapSignature = await signAndSend(
    wallet,
    new Uint8Array(Buffer.from(swap.swapTransaction, "base64")),
  );

  const decimals = await tokenDecimals(POKE_MINT);
  const solSpent = spendable / LAMPORTS_PER_SOL;
  const pokeBought = Number(quote.outAmount) / 10 ** decimals;

  const saved = await supabaseAdmin.from("buybacks").insert({
    tx_signature: swapSignature,
    sol_spent: solSpent,
    poke_bought: pokeBought,
  });
  if (saved.error) console.error("could not record buyback", saved.error);

  return { ok: true, claimSignature, swapSignature, solSpent, pokeBought };
}
