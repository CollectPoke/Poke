import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { ThemeToggle, useTheme } from "@/lib/theme";

const POKE_CA = "EoqZPcCZnvntyR8zybqr38aXF1fMhP1ckyu7zFWFPoke";

const navItems: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/cards", label: "All cards" },
  { to: "/pair", label: "Pair a coin" },
  { to: "/pairings", label: "Directory" },
  { to: "/buyback", label: "Buybacks" },
];

const linkClass =
  "rounded-full px-3.5 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white";
const linkActive = { className: "bg-poke-yellow text-poke-navy hover:text-poke-navy" };

export function SiteHeader() {
  const { user, username } = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [caCopied, setCaCopied] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-poke-navy-deep">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-[10px] text-white/70 sm:px-5 sm:text-[11px]">
          <span className="mono-num truncate uppercase tracking-[0.18em]">
            one name · one card · forever
          </span>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <span className="hidden lg:inline">Burn a card and its name frees up again.</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(POKE_CA).catch(() => {});
                setCaCopied(true);
                window.setTimeout(() => setCaCopied(false), 1600);
              }}
              aria-label="Copy the $POKE contract address"
              className="flex items-center gap-1.5 text-white transition-colors hover:text-poke-yellow"
              title="Click to copy the $POKE contract address"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
              <span className="mono-num hidden sm:inline">{caCopied ? "CA copied!" : "CA EoqZ…FPoke"}</span>
              <span className="mono-num sm:hidden">CA</span>
            </button>
            <a
              href="https://x.com/CollectPokeFun"
              target="_blank"
              rel="noreferrer"
              aria-label="Poke on X"
              className="flex items-center gap-1.5 text-white transition-colors hover:text-poke-yellow"
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img src="/favicon.png" alt="" className="h-8 w-8 shrink-0 drop-shadow sm:h-9 sm:w-9" />
            <span className="font-display text-xl font-bold leading-none text-poke-yellow drop-shadow-[0_2px_0_oklch(0.19_0.04_260)] sm:text-2xl">
              Poke
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className={linkClass}
                activeProps={linkActive}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/gallery" className={linkClass} activeProps={linkActive}>
                  My gallery
                </Link>
                <Link to="/account" className={linkClass} activeProps={linkActive}>
                  {username ?? "My binder"}
                </Link>
              </>
            ) : (
              <Link to="/auth" className={linkClass}>
                Sign in
              </Link>
            )}
            <ThemeToggle className="ml-2" />
            <Link to="/mint" className="poke-btn ml-2 !py-2 !px-4 text-sm">
              Mint a card
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <Link to="/mint" className="poke-btn !py-1.5 !px-3.5 text-xs">
              Mint
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                {open ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-white/10 bg-poke-navy lg:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-base font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact ?? false }}
                  className="rounded-xl px-4 py-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  activeProps={{ className: "bg-poke-yellow text-poke-navy hover:text-poke-navy" }}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                <Link
                  to="/gallery"
                  className="rounded-xl px-4 py-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  activeProps={{ className: "bg-poke-yellow text-poke-navy hover:text-poke-navy" }}
                >
                  My gallery
                </Link>
                <Link
                  to="/account"
                  className="rounded-xl px-4 py-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  activeProps={{ className: "bg-poke-yellow text-poke-navy hover:text-poke-navy" }}
                >
                  {username ?? "My binder"}
                </Link>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="rounded-xl px-4 py-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Sign in
                </Link>
              )}
              <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-white/80">
                  <span aria-hidden="true">{theme === "dark" ? "🌙" : "☀️"}</span>
                  {theme === "dark" ? "Night mode" : "Day mode"}
                </span>
                <ThemeToggle />
              </div>
            </nav>
          </div>
        ) : null}
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
