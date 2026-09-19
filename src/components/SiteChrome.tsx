import { Link } from "@tanstack/react-router";

const navItems: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/coins", label: "Coins" },
  { to: "/cards-sent", label: "Cards sent" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30">
      {/* Utility strip */}
      <div className="bg-poke-navy-deep">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-1.5 text-[11px] text-white/70">
          <span className="mono-num uppercase tracking-[0.2em]">
            launchpad on solana · paired with CARDS
          </span>
          <span className="hidden sm:inline">A coin is not a card. Sample data.</span>
        </div>
      </div>
      {/* Main nav bar */}
      <div className="border-b-4 border-poke-yellow bg-poke-navy shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="" className="h-9 w-9 drop-shadow" />
            <span className="font-display text-2xl font-bold leading-none text-poke-yellow drop-shadow-[0_2px_0_oklch(0.19_0.04_260)]">
              PokéPad
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className="rounded-full px-3.5 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                activeProps={{ className: "bg-poke-yellow text-poke-navy hover:text-poke-navy" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/launch"
              className="poke-btn ml-2 !py-2 !px-4 text-xs sm:text-sm"
            >
              Launch a coin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-poke-navy text-white/70">
      <div className="mx-auto max-w-6xl space-y-3 px-5 py-10 text-xs leading-relaxed">
        <div className="flex items-center gap-2.5 pb-2">
          <img src="/favicon.png" alt="" className="h-7 w-7" />
          <span className="font-display text-lg font-bold text-poke-yellow">PokéPad</span>
        </div>
        <p>
          A coin is not backed by cards and cannot be redeemed for them. It is a memecoin whose
          trading fees buy real graded cards for whoever holds it. Small coins earn small fees;
          below roughly $2,000 of volume per card, the pot waits.
        </p>
        <p>
          Coins, wallets, queues and purchases shown on this site are sample data until the engine
          is wired to mainnet. Pokémon and card artwork belong to Nintendo, Creatures and GAME
          FREAK / The Pokémon Company — no affiliation.
        </p>
      </div>
    </footer>
  );
}
