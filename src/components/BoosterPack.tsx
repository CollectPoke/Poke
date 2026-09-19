import type { CSSProperties } from "react";

// CSS-drawn Poke booster pack — the same pack style as the purchase animation,
// made to float around the homepage hero.
export function BoosterPack({
  className = "",
  label,
  delay = 0,
  tilt = "-6deg",
  art,
}: {
  className?: string;
  label: string;
  delay?: number;
  tilt?: string;
  /** Pokémon artwork URL printed on the pack wrapper */
  art?: string;
}) {
  return (
    <div
      className={`pack-float pointer-events-none relative select-none ${className}`}
      style={{ animationDelay: `${delay}s`, "--pack-tilt": tilt } as CSSProperties}
    >
      <div className="relative flex aspect-[3/4.2] w-full flex-col overflow-hidden rounded-lg border-2 border-white/25 shadow-2xl">
        {/* crimped foil top */}
        <div className="pack-crimp h-[9%] w-full" />
        {/* body */}
        <div className="pack-body relative flex flex-1 flex-col items-center justify-center gap-1.5 px-2">
          <div className="pack-sheen pointer-events-none absolute inset-0" />
          {art ? (
            <img src={art} alt="" className="w-3/5 drop-shadow-lg" loading="lazy" />
          ) : (
          <svg viewBox="0 0 24 24" className="w-1/3 drop-shadow" aria-hidden>
            <circle cx="12" cy="12" r="11" fill="oklch(0.97 0.01 250)" stroke="oklch(0.24 0.04 260)" strokeWidth="1.6" />
            <path d="M1.6 12h20.8" stroke="oklch(0.24 0.04 260)" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="3.4" fill="oklch(0.97 0.01 250)" stroke="oklch(0.24 0.04 260)" strokeWidth="1.4" />
          </svg>
          )}
          <p className="font-display text-[clamp(0.7rem,1.4vw,1rem)] font-bold leading-none text-white drop-shadow">
            Poke <span className="text-poke-yellow">Pack</span>
          </p>
          <p className="mono-num text-[0.55rem] font-bold uppercase tracking-[0.25em] text-white/70">
            {label}
          </p>
        </div>
        {/* crimped foil bottom */}
        <div className="pack-crimp h-[9%] w-full" />
      </div>
    </div>
  );
}
