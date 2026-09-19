# Real Pump.fun launch on every mint

## What changes

- Replace the generated fake contract address with a real Pump.fun token mint on Solana mainnet.
- Keep the current walletless experience: the signed-in trainer's built-in Poke wallet funds and signs the launch.
- Reserve **0.1 SOL total** for the launch. The app checks the trainer's balance before starting and never intentionally exceeds this cap.
- Use the card's name, ticker, description, and uploaded image as the coin metadata.
- Create the Poke card only after the Pump.fun transaction confirms. The card's CA becomes the real token mint address.
- Show launch progress, clear failure states, the confirmed mint address, and a Solscan receipt in the mint reveal and card page.
- Keep one name per active card/coin. Failed attempts release the reservation; successful names remain unique until the card is burned.

## Creator earnings and buybacks

- Route Pump.fun creator earnings to a protected Poke system wallet, not to the individual minter.
- Keep that wallet inaccessible from the browser and encrypted with the same server-side wallet protection already used for account wallets.
- Prepare its accumulated SOL for the existing 10-minute $POKE buyback process using token address `EoqZPcCZnvntyR8zybqr38aXF1fMhP1ckyu7zFWFPoke`.
- Record launch addresses and Solana transaction signatures so every launch is independently verifiable.

## Safety and failure handling

- Validate the name, ticker, image, balance, and listing price on the trusted server.
- Record pending, confirmed, and failed launch attempts without exposing wallet keys.
- Never create a card with a made-up CA or mark a launch successful before confirmation.
- Prevent duplicate submissions while a launch is pending.
- Explain that mainnet launches spend real SOL and are irreversible before confirmation.

## Technical details

- Use Pump.fun's official transaction-building/on-chain flow rather than an undocumented private frontend endpoint.
- Sign with the trainer's encrypted embedded Solana wallet on the server.
- Store a launch record linked one-to-one with the resulting card.
- Verify desktop and mobile mint flows, insufficient-balance handling, successful confirmation UI, card details, and TypeScript checks.

## Important limitation

The launch integration and fee routing can be completed now. Automatically swapping collected creator fees into `$POKE` every ten minutes also needs reliable scheduled execution and a swap route; that worker will be treated as a separate protected server process rather than simulated in the browser.
