/** One-off: claim Pump.fun creator fees and sweep the buyback wallet. */
import { claimAndSweep } from "../src/lib/buyback.server";

const destination = process.argv[2];
if (!destination) throw new Error("Usage: bun scripts/sweep-buyback.ts <address>");

const result = await claimAndSweep(destination);
console.log(JSON.stringify(result, null, 2));
