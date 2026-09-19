# Poke

Poke turns memecoins into one-of-one Pokémon-style trading cards. Launch a coin on Pump.fun and it mints as a collectible card — one active card per name, with the coin's contract address printed on the card itself.

**Live site:** https://collectpoke.fun

## How it works

- **Walletless accounts** — every account comes with its own built-in Solana wallet. Deposit SOL, mint, buy, sell and burn straight from your balance. Private keys are encrypted and exportable any time.
- **Minting** — pick a name, add artwork, and a real Pump.fun coin launches (up to 0.1 SOL: 0.075 into the coin's first buy, the rest covers fees). The confirmed contract address prints on your card with on-chain proof.
- **One-of-one rarity** — only one card can exist per name. Burning a card releases the name for someone else.
- **Trading** — buy and sell cards for SOL, view full ownership history, and verify everything on Solscan.
- **Pair a coin** — get an AI-powered Pokémon pairing for any memecoin (Pokédex number, typing, rarity).
- **$POKE buybacks** — 100% of platform fees buy back $POKE every 10 minutes, logged transparently.

CA: `EoqZPcCZnvntyR8zybqr38aXF1fMhP1ckyu7zFWFPoke`

## Tech

TypeScript · React 19 · TanStack Start · Tailwind CSS v4 · Solana (tweetnacl) · Pump.fun launch integration

## Development

Requires Node.js 18+.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

The dev server runs at `http://localhost:8080`.

## Disclaimer

Crypto is risky — never spend more than you can afford to lose. Poke is an independent project and is not affiliated with, endorsed by, or connected to Nintendo, Game Freak, or The Pokémon Company.
