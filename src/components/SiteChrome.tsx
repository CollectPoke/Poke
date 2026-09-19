import { Link } from "@tanstack/react-router";

import { useAuth } from "@/lib/auth";

const navItems: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/cards", label: "All cards" },
];

export function SiteHeader() {
  const { user, username } = useAuth();

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-poke-navy-deep">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-1.5 text-[11px] text-white/70">
          <span className="mono-num uppercase tracking-[0.2em]">
            one name · one card · forever
          </span>
          <span className="hidden sm:inline">Burn a card and its name frees up again.</span>
        </div>
      </div>
      <div className="border-b-4 border-poke-yellow bg-poke-navy shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="" className="h-9 w-9 drop-shadow" />
            <span className="font-display text-2xl font-bold leading-none text-poke-yellow drop-shadow-[0_2px_0_oklch(0.19_0.04_260)]">
              Poke
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
            {user ? (
              <Link
                to="/account"
                className="rounded-full px-3.5 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                activeProps={{ className: "bg-poke-yellow text-poke-navy hover:text-poke-navy" }}
              >
                {username ?? "My binder"}
              </Link>
            ) : (
              <Link
                to="/auth"
                className="rounded-full px-3.5 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Link>
            )}
            <Link to="/mint" className="poke-btn ml-2 !py-2 !px-4 text-xs sm:text-sm">
              Mint a card
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
          <span className="font-display text-lg font-bold text-poke-yellow">Poke</span>
        </div>
        <p>
          Poke is a launchpad where every coin becomes a one-of-one trading card. A name can only
          be minted once; burning a card releases its name back to everyone.
        </p>
        <p>
          Prices are shown in SOL and card ownership is recorded on Poke. Pokémon and card artwork
          belong to Nintendo, Creatures and GAME FREAK / The Pokémon Company — no affiliation.
        </p>
      </div>
    </footer>
  );
}
