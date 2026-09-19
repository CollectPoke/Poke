import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";

const POKE_CA = "EoqZPcCZnvntyR8zybqr38aXF1fMhP1ckyu7zFWFPoke";

const navItems: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/cards", label: "All cards" },
  { to: "/pair", label: "Pair a coin" },
  { to: "/pairings", label: "Directory" },
  { to: "/buyback", label: "Buybacks" },
  { to: "/docs", label: "How to" },
];

const linkClass =
  "rounded-full px-3.5 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white";
const linkActive = { className: "bg-poke-yellow text-poke-navy hover:text-poke-navy" };

export function SiteHeader() {
  const { user, username } = useAuth();
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
            <Link
              to="/docs"
              aria-label="Poke docs and how-to"
              className="flex items-center gap-1.5 text-white transition-colors hover:text-poke-yellow"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v13A2.5 2.5 0 0 0 6.5 20H20a1 1 0 0 0 0-2H6.5a.5.5 0 0 1 0-1H20a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6.5Zm2 3h8a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.78.41L15 11l-1.22.91A.5.5 0 0 1 13 11.5v-6a.5.5 0 0 1 .5-.5Z" />
              </svg>
              <span className="hidden sm:inline">Docs</span>
            </Link>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Poke on GitHub"
              className="flex items-center gap-1.5 text-white transition-colors hover:text-poke-yellow"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z" />
              </svg>
              <span className="hidden md:inline">GitHub</span>
            </a>
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
                <Link
                  to="/account"
                  activeProps={{ className: "border-poke-yellow/60 bg-white/10" }}
                  className="group relative flex max-w-[180px] items-center gap-2.5 overflow-hidden rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3.5 transition-all duration-300 hover:border-poke-yellow/60 hover:bg-white/10"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-poke-yellow to-amber-500 shadow-[0_0_10px_oklch(0.85_0.16_95/0.35)] transition-shadow group-hover:shadow-[0_0_16px_oklch(0.85_0.16_95/0.55)]">
                    <img src="/favicon.png" alt="" className="h-5 w-5 drop-shadow" />
                  </span>
                  <span className="flex min-w-0 flex-col leading-none">
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-poke-yellow/80">
                      Trainer
                    </span>
                    <span className="truncate text-sm font-bold text-white transition-colors group-hover:text-poke-yellow">
                      {username ?? "Trainer"}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-tr from-transparent via-white/25 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"
                  />
                </Link>
              </>
            ) : (
              <Link to="/auth" className={linkClass}>
                Sign in
              </Link>
            )}
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
                    className="group mx-1 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:border-poke-yellow/50 hover:bg-white/10"
                    activeProps={{ className: "border-poke-yellow/60 bg-white/10" }}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-poke-yellow to-amber-500 shadow-[0_0_10px_oklch(0.85_0.16_95/0.35)]">
                      <img src="/favicon.png" alt="" className="h-6 w-6 drop-shadow" />
                    </span>
                    <span className="flex min-w-0 flex-col leading-none">
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-poke-yellow/80">
                        Trainer
                      </span>
                      <span className="truncate text-base font-bold text-white">
                        {username ?? "Trainer"}
                      </span>
                    </span>
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
