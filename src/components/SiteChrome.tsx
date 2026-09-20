import pigAsset from "@/assets/pig.webp.asset.json";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";

const navItems: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/cards", label: "All NFTs" },
  { to: "/mint", label: "Mint" },
  { to: "/buy", label: "Buy" },
  { to: "/sell", label: "Sell" },
  { to: "/docs", label: "How to" },
];

const linkClass =
  "hud-label border-b border-transparent px-3 py-2 text-foreground/60 transition-colors hover:border-foreground/40 hover:text-foreground";
const linkActive = { className: "border-brand text-brand hover:text-brand" };

export function SiteHeader() {
  const { user, username } = useAuth();
  const [open, setOpen] = useState(false);
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
      <div className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-[10px] text-foreground/60 sm:px-5 sm:text-[11px]">
          <span className="mono-num hidden truncate uppercase tracking-[0.18em] text-brand xs:inline sm:inline">
            jpeg protocol // mainnet online
          </span>
          <span className="mono-num truncate uppercase tracking-[0.18em] sm:hidden">jpeg</span>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <span className="hidden lg:inline">
              1/1 arena · live ownership · real coin attached
            </span>
            <Link
              to="/docs"
              aria-label="JPEG docs and how-to"
              className="-my-1 flex items-center gap-1.5 px-1 py-2 text-foreground transition-colors hover:text-brand"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v13A2.5 2.5 0 0 0 6.5 20H20a1 1 0 0 0 0-2H6.5a.5.5 0 0 1 0-1H20a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6.5Zm2 3h8a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.78.41L15 11l-1.22.91A.5.5 0 0 1 13 11.5v-6a.5.5 0 0 1 .5-.5Z" />
              </svg>
              <span className="hidden sm:inline">Docs</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img src={pigAsset.url} alt="" className="h-8 w-8 shrink-0 drop-shadow sm:h-9 sm:w-9" />
            <span className="font-display text-xl font-black leading-none text-foreground tracking-normal sm:text-2xl">
              JPEG
            </span>
            <span className="hud-label hidden border-l border-border pl-2 text-muted-foreground sm:inline">
              Arena
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
                  My NFTs
                </Link>
                <Link
                  to="/account"
                  activeProps={{ className: "border-brand/60" }}
                  className="group relative flex max-w-[180px] items-center gap-2.5 overflow-hidden border border-border bg-secondary py-1 pl-1 pr-3.5 transition-all duration-300 hover:border-brand/60"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-violet shadow-[0_0_10px_oklch(0.85_0.16_95/0.35)] transition-shadow group-hover:shadow-[0_0_16px_oklch(0.85_0.16_95/0.55)]">
                    <img src={pigAsset.url} alt="" className="h-5 w-5 drop-shadow" />
                  </span>
                  <span className="flex min-w-0 flex-col leading-none">
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-brand/80">
                      Collector
                    </span>
                    <span className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-brand">
                      {username ?? "Collector"}
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
            <Link to="/mint" className="primary-btn ml-2 !py-2 !px-4 text-sm">
              Mint an NFT
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <Link to="/mint" className="primary-btn !py-2.5 !px-4 text-xs">
              Mint
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center border border-border text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
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
          <div className="border-t border-border bg-background lg:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-base font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact ?? false }}
                  className="rounded-xl px-4 py-3 text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                  activeProps={{
                    className: "bg-brand text-brand-foreground hover:text-brand-foreground",
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/gallery"
                    className="rounded-xl px-4 py-3 text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                    activeProps={{
                      className: "bg-brand text-brand-foreground hover:text-brand-foreground",
                    }}
                  >
                    My NFTs
                  </Link>
                  <Link
                    to="/account"
                    className="group mx-1 flex items-center gap-3 rounded-2xl border border-border bg-secondary px-3 py-2.5 transition-colors hover:border-brand/50"
                    activeProps={{ className: "border-brand/60" }}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-violet shadow-[0_0_10px_oklch(0.85_0.16_95/0.35)]">
                      <img src={pigAsset.url} alt="" className="h-6 w-6 drop-shadow" />
                    </span>
                    <span className="flex min-w-0 flex-col leading-none">
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-brand/80">
                        Collector
                      </span>
                      <span className="truncate text-base font-bold text-foreground">
                        {username ?? "Collector"}
                      </span>
                    </span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="rounded-xl px-4 py-3 text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
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

const footerExplore: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/mint", label: "Mint an NFT" },
  { to: "/cards", label: "All NFTs" },
  { to: "/buy", label: "Buy" },
  { to: "/sell", label: "Sell" },
];

const footerAccount: { to: string; label: string }[] = [
  { to: "/auth", label: "Sign in / Create account" },
  { to: "/account", label: "My collection" },
  { to: "/gallery", label: "My NFTs" },
  { to: "/mint", label: "Launch an NFT (0.1 SOL flat fee)" },
];

const footerHowTo: { to: string; label: string }[] = [
  { to: "/docs#what", label: "What is JPEG?" },
  { to: "/docs#start", label: "Getting started" },
  { to: "/docs#fund", label: "Funding your wallet" },
  { to: "/docs#mint", label: "Minting an NFT" },
  { to: "/docs#trade", label: "Buying, selling & burning" },
  { to: "/docs#faq", label: "FAQ" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-background text-muted-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img src={pigAsset.url} alt="" className="h-8 w-8" />
            <span className="font-display text-xl font-bold text-brand">JPEG</span>
          </div>
          <p className="text-xs leading-relaxed">
            One jpeg · one coin · forever. Every NFT minted on JPEG launches a real Pump.fun coin
            attached to it — burn an NFT and its name frees up again.
          </p>
        </div>

        <FooterColumn title="Explore">
          {footerExplore.map((item) => (
            <FooterLink key={item.to} to={item.to} exact={item.exact}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="How to">
          {footerHowTo.map((item) => (
            <FooterLink key={item.to} to={item.to}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Your account">
          {footerAccount.map((item) => (
            <FooterLink key={item.label} to={item.to}>
              {item.label}
            </FooterLink>
          ))}
          <li>
            <a
              href="https://solscan.io"
              target="_blank"
              rel="noreferrer"
              className="footer-link inline-block py-1"
            >
              Solana explorer (Solscan)
            </a>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl space-y-2 px-5 pb-24 pt-6 text-[11px] leading-relaxed text-foreground/50 sm:pb-6">
          <p>
            Prices are shown in SOL. Minting launches a real Pump.fun coin for a flat 0.1 SOL fee
            (it covers the launch and network fees).
          </p>
          <p>
            Artwork belongs to the people who upload it. Crypto is risky: never deposit more than
            you can afford to lose.
          </p>
          <p>© {new Date().getFullYear()} JPEG · mintjpeg.com</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-brand">
        {title}
      </h3>
      <ul className="space-y-2 text-[13px]">{children}</ul>
    </div>
  );
}

function FooterLink({
  to,
  exact,
  children,
}: {
  to: string;
  exact?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        to={to}
        activeOptions={{ exact: exact ?? false, includeSearch: false }}
        className="footer-link inline-block py-1"
        activeProps={{ className: "footer-link footer-link-active inline-block py-1" }}
      >
        {children}
      </Link>
    </li>
  );
}
