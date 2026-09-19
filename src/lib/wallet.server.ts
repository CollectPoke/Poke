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

export type SystemWalletRow = { purpose: string; public_key: string; secret_ciphertext: string };

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
  return row;
}

/** A server-only wallet used to receive Pump.fun creator earnings for buybacks. */
export async function getOrCreateSystemWallet(purpose: string): Promise<SystemWalletRow> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const existing = await supabaseAdmin
    .from("system_wallets")
    .select("purpose, public_key, secret_ciphertext")
    .eq("purpose", purpose)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as SystemWalletRow;

  const kp = nacl.sign.keyPair();
  const row = {
    purpose,
    public_key: bs58.encode(kp.publicKey),
    secret_ciphertext: encryptSecret(bs58.encode(kp.secretKey)),
  };
  const inserted = await supabaseAdmin.from("system_wallets").insert(row);
  if (inserted.error) {
    const again = await supabaseAdmin
      .from("system_wallets")
      .select("purpose, public_key, secret_ciphertext")
      .eq("purpose", purpose)
      .maybeSingle();
    if (again.data) return again.data as SystemWalletRow;
    throw inserted.error;
  }
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

export type WalletActivity = {
  signature: string;
  slot: number;
  blockTime: number | null;
  status: "pending" | "confirmed" | "failed";
  changeSol: number | null;
};

/** Recent on-chain activity for an address, newest first. */
export async function getRecentActivity(address: string, limit = 12): Promise<WalletActivity[]> {
  try {
    const sigs = await rpc<
      {
        signature: string;
        slot: number;
        blockTime: number | null;
        err: unknown;
        confirmationStatus?: string | null;
      }[]
    >("getSignaturesForAddress", [address, { limit }]);
    return (sigs ?? []).map((s) => ({
      signature: s.signature,
      slot: s.slot,
      blockTime: s.blockTime ?? null,
      status: s.err ? "failed" : s.confirmationStatus === "finalized" ? "confirmed" : "pending",
      changeSol: null,
    }));
  } catch {
    return [];
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

/** Co-signs a Pump.fun transaction while preserving its mint signature. */
export async function signSimulateAndSendTransaction(
  from: WalletRow,
  base64Transaction: string,
  maxDebitLamports: number,
  onPrepared?: (signature: string) => Promise<void>,
): Promise<string> {
  const raw = new Uint8Array(Buffer.from(base64Transaction, "base64"));
  const [signatureCount, signaturesStart] = readCompactLen(raw, 0);
  const messageStart = signaturesStart + signatureCount * 64;
  if (signatureCount < 1 || messageStart >= raw.length) {
    throw new Error("Pump.fun returned an invalid transaction");
  }

  const message = raw.subarray(messageStart);
  let cursor = 0;
  if (((message[0] ?? 0) & 0x80) !== 0) cursor += 1;
  const requiredSignatures = message[cursor] ?? 0;
  cursor += 3;
  const [keyCount, keysStart] = readCompactLen(message, cursor);
  const publicKey = bs58.decode(from.public_key);
  let signerIndex = -1;
  for (let index = 0; index < keyCount; index += 1) {
    const keyBytes = message.subarray(keysStart + index * 32, keysStart + (index + 1) * 32);
    if (keyBytes.length === 32 && keyBytes.every((byte, i) => byte === publicKey[i])) {
      signerIndex = index;
      break;
    }
  }
  if (signerIndex < 0 || signerIndex >= requiredSignatures) {
    throw new Error("Your Poke wallet is not an authorized signer for this launch");
  }
  const feePayer = message.subarray(keysStart, keysStart + 32);
  if (!feePayer.every((byte, i) => byte === publicKey[i])) {
    throw new Error("Pump.fun returned an unexpected fee payer");
  }

  const signed = raw.slice();
  const signature = nacl.sign.detached(message, secretKeyFrom(from));
  signed.set(signature, signaturesStart + signerIndex * 64);

  for (let index = 0; index < requiredSignatures; index += 1) {
    const slot = signed.subarray(signaturesStart + index * 64, signaturesStart + (index + 1) * 64);
    if (slot.every((byte) => byte === 0)) {
      throw new Error("Pump.fun did not supply every required launch signature");
    }
  }

  const signedBase64 = Buffer.from(signed).toString("base64");
  const transactionSignature = bs58.encode(
    signed.subarray(signaturesStart, signaturesStart + 64),
  );
  const beforeLamports = Math.round((await getBalanceSol(from.public_key)) * LAMPORTS_PER_SOL);
  const simulation = await rpc<{
    value: { err: unknown; logs?: string[]; accounts?: Array<{ lamports: number } | null> | null };
  }>("simulateTransaction", [
    signedBase64,
    {
      encoding: "base64",
      sigVerify: true,
      commitment: "confirmed",
      accounts: { encoding: "base64", addresses: [from.public_key] },
    },
  ]);
  if (simulation.value.err) {
    console.error("launch simulation failed", {
      err: simulation.value.err,
      logs: simulation.value.logs?.slice(-10),
    });
    const detail = simulation.value.logs?.filter((line) => /error|failed/i.test(line)).slice(-2).join(" | ");
    throw new Error(
      `The Pump.fun launch simulation failed. No SOL was spent.${detail ? ` (${detail})` : ""}`,
    );
  }
  const afterLamports = simulation.value.accounts?.[0]?.lamports;
  if (typeof afterLamports !== "number") {
    throw new Error("Could not verify the launch cost. No SOL was spent.");
  }
  const simulatedDebit = beforeLamports - afterLamports;
  if (simulatedDebit < 0 || simulatedDebit > maxDebitLamports) {
    throw new Error("The launch would exceed the 0.1 SOL limit. No SOL was spent.");
  }

  const submittedSignature = await rpc<string>("sendTransaction", [
    signedBase64,
    { encoding: "base64", maxRetries: 3, preflightCommitment: "confirmed" },
  ]);
  if (submittedSignature !== transactionSignature) {
    throw new Error("Solana returned an unexpected launch receipt");
  }
  return submittedSignature;
}

export async function confirmSignature(signature: string): Promise<void> {
  for (let i = 0; i < 45; i += 1) {
    const result = await rpc<{
      value: Array<{ confirmationStatus?: string; err?: unknown } | null>;
    }>("getSignatureStatuses", [[signature], { searchTransactionHistory: true }]);
    const status = result.value?.[0];
    if (status?.err) throw new Error("The coin launch failed on Solana");
    if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("The launch is still confirming on Solana. Try minting again shortly to resume it.");
}

/**
 * What actually happened on-chain for a signature.
 * "landed"  — the transaction succeeded (SOL was spent)
 * "reverted"— it hit the chain but errored (only the tiny network fee applies)
 * "dropped" — the chain has never seen it, so nothing was charged
 * "unknown" — we could not reach the chain to check
 */
export async function signatureOutcome(
  signature: string,
): Promise<"landed" | "reverted" | "dropped" | "unknown"> {
  try {
    const result = await rpc<{
      value: Array<{ confirmationStatus?: string; err?: unknown } | null>;
    }>("getSignatureStatuses", [[signature], { searchTransactionHistory: true }]);
    const status = result.value?.[0];
    if (!status) return "dropped";
    if (status.err) return "reverted";
    if (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized") {
      return "landed";
    }
    return "unknown";
  } catch {
    return "unknown";
  }
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
