/** One-off: claim Pump.fun creator fees for a wallet and sweep it to an address. */
import { claimAndSweep } from "../src/lib/buyback.server";

const destination = process.argv[2];
const fromPublicKey = process.argv[3];
if (!destination) throw new Error("Usage: bun scripts/sweep-buyback.ts <destination> [fromPublicKey]");

let from;
if (fromPublicKey) {
  const { supabaseAdmin } = await import("../src/integrations/supabase/client.server");
  const row = await supabaseAdmin
    .from("wallets")
    .select("public_key, secret_ciphertext")
    .eq("public_key", fromPublicKey)
    .maybeSingle();
  if (row.error || !row.data) throw new Error("Wallet not found");
  from = { purpose: "user", public_key: row.data.public_key, secret_ciphertext: row.data.secret_ciphertext };
}

const result = await claimAndSweep(destination, from);
console.log(JSON.stringify(result, null, 2));
