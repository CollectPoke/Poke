import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs & How to — Poke" },
      {
        name: "description",
        content:
          "Everything you need to know about Poke: how minting launches a real coin, how the built-in wallet works, buying, selling, burning and the 10-minute $POKE buyback.",
      },
      { property: "og:title", content: "Docs & How to — Poke" },
      {
        property: "og:description",
        content:
          "How Poke works: one-of-one coin cards, real Pump.fun launches, a built-in wallet, and fees that buy back $POKE every 10 minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocsPage,
});

const sections = [
  { id: "what", title: "What is Poke?" },
  { id: "start", title: "Getting started" },
  { id: "fund", title: "Funding your wallet" },
  { id: "mint", title: "Minting an NFT" },
  { id: "trade", title: "Buying, selling & burning" },
  { id: "buyback", title: "Fees & the $POKE buyback" },
  { id: "faq", title: "FAQ" },
];

function DocsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-2xl border-2 border-poke-navy-deep bg-poke-blue p-8 text-center shadow-xl sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-poke-yellow">
          Collector handbook
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-card sm:text-5xl">
          Docs &amp; How to
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-card/85 sm:text-base">
          Everything about Poke in one place — what it is, how minting launches
          a real coin, and how buying, selling and the buyback work.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Contents */}
        <nav className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border-2 border-border bg-card p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Contents
            </p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-lg px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary hover:text-poke-blue"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Body */}
        <div className="space-y-6">
          <DocCard id="what" title="What is Poke?">
            <p>
              Poke is a launchpad where every coin becomes a{" "}
              <strong>one-of-one NFT</strong>. When someone mints{" "}
              <strong>Dog</strong>, a real coin launches on Solana via Pump.fun
              and its contract address is printed on the NFT forever.
            </p>
            <p>
              Each name can only exist <strong>once</strong> — after{" "}
              <strong>Dog</strong> is minted, nobody else can ever mint Dog
              again, unless the current holder burns the NFT. That's the
              rarity: there is exactly one of every NFT, like a 1st edition.
            </p>
            <p>
              Everything is <strong>walletless</strong>: no extensions, no
              Phantom, no seed phrases to lose. Your account comes with its own
              Solana address and you do everything from the site.
            </p>
          </DocCard>

          <DocCard id="start" title="Getting started">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Create an account with email &amp; password or Google on the{" "}
                <Link to="/auth" className="font-semibold text-poke-blue underline">
                  sign-in page
                </Link>
                .
              </li>
              <li>
                Pick a collector name — this shows on every NFT you mint or own.
              </li>
              <li>
                Your account instantly gets its own{" "}
                <strong>Solana deposit address</strong>, visible on your{" "}
                <Link to="/account" className="font-semibold text-poke-blue underline">
                  profile
                </Link>
                .
              </li>
            </ol>
          </DocCard>

          <DocCard id="fund" title="Funding your wallet">
            <p>
              Every Poke account has a built-in Solana wallet. To fund it, send
              SOL from anywhere (an exchange, Phantom, a friend) to the deposit
              address on your profile page.
            </p>
            <p>
              Your balance and recent transfers update live on your profile.
              Because each account has a unique address, every launch and trade
              is traceable back to the collector who did it.
            </p>
            <p>
              You stay in control: you can <strong>send SOL out</strong> or{" "}
              <strong>export your private key</strong> at any time from your
              profile. Treat that key like cash — anyone who has it controls
              your funds.
            </p>
          </DocCard>

          <DocCard id="mint" title="Minting an NFT">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Go to{" "}
                <Link to="/mint" className="font-semibold text-poke-blue underline">
                  Mint an NFT
                </Link>{" "}
                and choose a name and ticker. The name is checked live — if it's
                taken, you'll see it straight away.
              </li>
              <li>Add a description and drop in an image (required — it's the NFT's art).</li>
              <li>
                Optionally tick <strong>“List for sale immediately”</strong> and
                set a price in SOL.
              </li>
              <li>
                Hit <strong>Launch coin + mint card</strong>. The cost is a flat{" "}
                <strong>0.1 SOL launch fee</strong>, taken from your Poke wallet —
                that covers the real Pump.fun launch and network fees.
              </li>
              <li>
                Once Solana confirms, the real contract address appears at the
                bottom of your card with a Solscan receipt, and the NFT is
                yours.
              </li>
            </ol>
            <p>
              Not sure which Pokémon fits your coin? Tap{" "}
              <strong className="font-semibold">Find my Pokémon</strong> on the{" "}
              <Link to="/mint" className="font-semibold text-poke-blue underline">
                Mint page
              </Link>{" "}
              — it suggests a Pokémon with a short reason, a typing and a rarity,
              right next to your card preview.
            </p>
          </DocCard>

          <DocCard id="trade" title="Buying, selling & burning">
            <p>
              <strong>Selling:</strong> open an NFT you own and set a price, or
              list it while minting. You can change the price or unlist any
              time.
            </p>
            <p>
              <strong>Buying:</strong> open a listed card and hit buy. The exact
              SOL amount moves straight from your Poke wallet to the seller's
              Poke wallet on Solana — then ownership transfers to you. Every
              sale gets a Solscan receipt in the NFT's history.
            </p>
            <p>
              <strong>Burning:</strong> the owner can burn an NFT, destroying it
              forever. This releases the name so someone else can mint it again.
            </p>
          </DocCard>

          <DocCard id="buyback" title="Fees & the $POKE buyback">
            <p>
              100% of the fees from coins launched on Poke are used to{" "}
              <strong>buy back $POKE</strong>. A run happens every{" "}
              <strong>10 minutes</strong>, and every run is posted to the{" "}
              <Link to="/buyback" className="font-semibold text-poke-blue underline">
                Buybacks
              </Link>{" "}
              page with its Solscan transaction — fully verifiable on-chain.
            </p>
          </DocCard>

          <DocCard id="faq" title="FAQ">
            <Faq
              q="Is this real money?"
              a="Yes. Deposits, mints and card sales move real mainnet SOL between real Solana addresses. Transfers are irreversible."
            />
            <Faq
              q="Do I need a wallet app?"
              a="No. Your account's wallet is built in. If you ever want to leave, export the private key from your profile and import it anywhere."
            />
            <Faq
              q="What happens if the name I want is taken?"
              a="You can't mint it while its card exists. The only way a name frees up is if the current holder burns the NFT."
            />
            <Faq
              q="Can I change an NFT after minting?"
              a="Only the sale price and listing status. The name, ticker, image, description and contract address are locked forever."
            />
            <Faq
              q="Is Poke affiliated with Pokémon?"
              a="No. Poke is an independent fan-style project and is not affiliated with Nintendo, Creatures Inc. or GAME FREAK."
            />
          </DocCard>

          <div className="rounded-xl border-2 border-poke-yellow bg-poke-yellow/15 p-6 text-center">
            <p className="font-display text-xl font-bold text-foreground">
              Ready to claim a name?
            </p>
            <Link
              to="/mint"
              className="poke-btn mt-3 inline-block rounded-xl px-6 py-2.5 text-sm font-bold"
            >
              Mint your first NFT
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function DocCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border-2 border-border bg-card p-6 shadow-sm sm:p-7"
    >
      <h2 className="mb-3 font-display text-2xl font-bold text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <p className="text-sm font-bold text-foreground">{q}</p>
      <p className="mt-1 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
