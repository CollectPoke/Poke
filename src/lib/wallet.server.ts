import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import bs58 from "bs58";

export const RPC_URL = process.env["SOLANA_RPC_URL"] || "https://api.mainnet-beta.solana.com";
export { LAMPORTS_PER_SOL };

export function connection() {
  return new Connection(RPC_URL, "confirmed");
}

function key(): Buffer {
  const raw = process.env["WALLET_ENCRYPTION_KEY"];
  if (!raw) throw new Error("Wallet encryption key is not configured");
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64");
}

export function decryptSecret(stored: string): string {
  const buf = Buffer.from(stored, "base64");
  const d = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}

export type WalletRow = { user_id: string; public_key: string; secret_ciphertext: string };

export async function getOrCreateWallet(userId: string): Promise<WalletRow> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const existing = await supabaseAdmin
    .from("wallets")
    .select("user_id, public_key, secret_ciphertext")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as WalletRow;

  const kp = Keypair.generate();
  const row = {
    user_id: userId,
    public_key: kp.publicKey.toBase58(),
    secret_ciphertext: encryptSecret(bs58.encode(kp.secretKey)),
  };
  const ins = await supabaseAdmin.from("wallets").insert(row);
  if (ins.error) {
    // race: another request created it
    const again = await supabaseAdmin
      .from("wallets")
      .select("user_id, public_key, secret_ciphertext")
      .eq("user_id", userId)
      .maybeSingle();
    if (again.data) return again.data as WalletRow;
    throw ins.error;
  }
  await supabaseAdmin.from("profiles").update({ wallet_address: row.public_key }).eq("id", userId);
  return row;
}

export function keypairFrom(row: WalletRow): Keypair {
  return Keypair.fromSecretKey(bs58.decode(decryptSecret(row.secret_ciphertext)));
}

export async function getBalanceSol(address: string): Promise<number> {
  try {
    const lamports = await connection().getBalance(new PublicKey(address));
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

export async function sendSol(from: WalletRow, toAddress: string, amountSol: number) {
  const conn = connection();
  const payer = keypairFrom(from);
  const to = new PublicKey(toAddress);
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
  const balance = await conn.getBalance(payer.publicKey);
  if (balance < lamports + 5000) throw new Error("Not enough SOL in your account wallet (remember the network fee)");

  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: to, lamports }),
  );
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer.publicKey;
  tx.sign(payer);
  const sig = await conn.sendRawTransaction(tx.serialize(), { maxRetries: 3 });
  await conn.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
  return sig;
}
