import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/", label: "Home", exact: true },
  { to: "/coins", label: "Coins" },
  { to: "/cards-sent", label: "Cards sent" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl">PokéPad</span>
          <span className="mono-num hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            trade → slab
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={item.exact ? { exact: true } : undefined}
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/launch"
            className="ml-1 rounded-full bg-foreground px-3.5 py-1.5 text-background transition-opacity hover:opacity-90"
          >
            Launch a coin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-5xl space-y-2 px-5 py-10 text-xs leading-relaxed text-muted-foreground">
      <p>
        A coin is not backed by cards and cannot be redeemed for them. It is a memecoin whose trading
        fees buy real graded cards for whoever holds it. Small coins earn small fees; below roughly
        $2,000 of volume per card, the pot waits.
      </p>
      <p>
        Coins, wallets, queues and purchases shown on this site are sample data until the engine is
        wired to mainnet. Pokémon and card artwork belong to Nintendo, Creatures and GAME FREAK / The
        Pokémon Company — no affiliation.
      </p>
    </footer>
  );
}
