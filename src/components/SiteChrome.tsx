import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";

const navItems: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/cards", label: "All cards" },
  { to: "/pair", label: "Pair a coin" },
  { to: "/pairings", label: "Directory" },
  { to: "/buyback", label: "Buybacks" },
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
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Burn a card and its name frees up again.</span>
            <a
              href="https://x.com/CollectPokeFun"
              target="_blank"
              rel="noreferrer"
              aria-label="Poke on X"
              className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-poke-yellow"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
              </svg>
              <span className="hidden sm:inline">@CollectPokeFun</span>
            </a>
          </div>
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
        <div className="flex items-center gap-2 pt-1">
          <a
            href="https://x.com/CollectPokeFun"
            target="_blank"
            rel="noreferrer"
            aria-label="Poke on X"
            className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-poke-yellow"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
            </svg>
            <span>@CollectPokeFun</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
