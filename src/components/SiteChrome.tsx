import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl">PokéPad</span>
          <span className="mono-num hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            trade → slab
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            Dex
          </Link>
          <Link
            to="/vault"
            className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            Vault
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-5xl px-5 py-10 text-xs leading-relaxed text-muted-foreground">
      Prices from CoinGecko. Vault holdings are the cards bought with trading fees. A token is not a
      card and cannot be redeemed for one. Pokémon and card artwork belong to Nintendo, Creatures and
      GAME FREAK / The Pokémon Company — no affiliation.
    </footer>
  );
}
