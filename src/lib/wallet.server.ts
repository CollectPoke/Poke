import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";

export const RPC_URL = process.env["SOLANA_RPC_URL"] || "https://api.mainnet-beta.solana.com";
export const LAMPORTS_PER_SOL = 1_000_000_000;

const SYSTEM_PROGRAM = "11111111111111111111111111111111";

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

  const kp = nacl.sign.keyPair();
  const row = {
    user_id: userId,
    public_key: bs58.encode(kp.publicKey),
    secret_ciphertext: encryptSecret(bs58.encode(kp.secretKey)),
  };
  const ins = await supabaseAdmin.from("wallets").insert(row);
  if (ins.error) {
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

export function secretKeyFrom(row: WalletRow): Uint8Array {
  return bs58.decode(decryptSecret(row.secret_ciphertext));
}

export async function getBalanceSol(address: string): Promise<number> {
  try {
    const r = await rpc<{ value: number }>("getBalance", [address]);
    return (r?.value ?? 0) / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

/** compact-u16 length prefix used by Solana's tx format */
function compactLen(n: number): number[] {
  const out: number[] = [];
  let rem = n;
  for (;;) {
    let b = rem & 0x7f;
    rem >>= 7;
    if (rem === 0) {
      out.push(b);
      break;
    }
    b |= 0x80;
    out.push(b);
  }
  return out;
}

function u64le(value: number): number[] {
  const buf = new Uint8Array(8);
  new DataView(buf.buffer).setBigUint64(0, BigInt(value), true);
  return Array.from(buf);
}

/** Build a legacy transaction message: single SystemProgram transfer. */
function buildTransferMessage(from: string, to: string, lamports: number, blockhash: string): Uint8Array {
  const keys = [from, to, SYSTEM_PROGRAM];
  const bytes: number[] = [];
  // header: 1 required signature, 0 readonly signed, 1 readonly unsigned (system program)
  bytes.push(1, 0, 1);
  bytes.push(...compactLen(keys.length));
  for (const k of keys) bytes.push(...Array.from(bs58.decode(k)));
  bytes.push(...Array.from(bs58.decode(blockhash)));
  // instructions
  bytes.push(...compactLen(1));
  bytes.push(2); // program id index (system program)
  bytes.push(...compactLen(2), 0, 1); // account indexes: from, to
  const data = [2, 0, 0, 0, ...u64le(lamports)]; // transfer instruction
  bytes.push(...compactLen(data.length), ...data);
  return new Uint8Array(bytes);
}

export async function sendSol(from: WalletRow, toAddress: string, amountSol: number): Promise<string> {
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
  if (!Number.isFinite(lamports) || lamports <= 0) throw new Error("Invalid amount");
  if (toAddress === from.public_key) throw new Error("That is your own wallet address");

  const balanceLamports = Math.round((await getBalanceSol(from.public_key)) * LAMPORTS_PER_SOL);
  if (balanceLamports < lamports + 5000) {
    throw new Error("Not enough SOL in your account wallet (remember the network fee)");
  }

  const secret = secretKeyFrom(from);
  const latest = await rpc<{ value: { blockhash: string } }>("getLatestBlockhash", [{ commitment: "confirmed" }]);
  const blockhash = latest.value.blockhash;

  const message = buildTransferMessage(from.public_key, toAddress, lamports, blockhash);
  const signature = nacl.sign.detached(message, secret);

  const tx = new Uint8Array([...compactLen(1), ...signature, ...message]);
  const base64 = Buffer.from(tx).toString("base64");

  const sig = await rpc<string>("sendTransaction", [
    base64,
    { encoding: "base64", maxRetries: 3, preflightCommitment: "confirmed" },
  ]);

  // poll for confirmation (up to ~30s)
  for (let i = 0; i < 30; i++) {
    const st = await rpc<{ value: Array<{ confirmationStatus?: string; err?: unknown } | null> }>(
      "getSignatureStatuses",
      [[sig], { searchTransactionHistory: true }],
    );
    const s = st.value?.[0];
    if (s) {
      if (s.err) throw new Error("The transfer failed on Solana");
      if (s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized") break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  return sig;
}
