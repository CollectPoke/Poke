import type { CSSProperties } from "react";

// One graded "slab" card peeking out from behind the pack, PSA-style.
function Slab({
  side,
  art,
  grade,
}: {
  side: "left" | "right";
  art: string;
  grade: string;
}) {
  const isLeft = side === "left";
  return (
    <div
      className={`absolute top-[-14%] aspect-[3/4.4] w-[62%] rounded-md border border-black/20 bg-gradient-to-b from-slate-100 to-slate-300 shadow-xl ${
        isLeft ? "left-[-26%] -rotate-12" : "right-[-26%] rotate-12"
      }`}
      aria-hidden
    >
      {/* grading label */}
      <div
        className={`mx-[6%] mt-[6%] flex items-center justify-between rounded-sm px-1.5 py-1 ${
          isLeft ? "bg-amber-400" : "bg-red-600"
        }`}
      >
        <span className="mono-num text-[0.4rem] font-bold uppercase tracking-wider text-white drop-shadow-sm">
          Poke · 1/1
        </span>
        <span className="mono-num text-[0.5rem] font-black text-white drop-shadow-sm">
          {grade}
        </span>
      </div>
      {/* card window */}
      <div className="mx-[6%] mt-[5%] flex aspect-[3/3.4] items-center justify-center overflow-hidden rounded-sm bg-gradient-to-b from-slate-800 to-slate-950">
        <img src={art} alt="" className="w-4/5 drop-shadow-lg" loading="lazy" />
      </div>
      {/* slab glare */}
      <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-br from-white/35 via-transparent to-transparent" />
    </div>
  );
}

// CSS-drawn Poke booster pack — glossy foil wrapper with two graded slabs
// behind it, like the gacha pack cards on jup.ag.
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
  const artUrl = art ?? "";
  return (
    <div
      className={`pack-float pointer-events-none relative select-none ${className}`}
      style={{ animationDelay: `${delay}s`, "--pack-tilt": tilt } as CSSProperties}
    >
      {/* graded slabs peeking behind */}
      <Slab side="left" art={artUrl} grade="10" />
      <Slab side="right" art={artUrl} grade="9.5" />

      {/* foil pack in front */}
      <div className="pack-foil relative z-10 flex aspect-[3/4.4] w-full flex-col overflow-hidden rounded-lg border border-white/40 shadow-2xl">
        {/* crimped foil top */}
        <div className="pack-crimp h-[8%] w-full" />
        {/* body */}
        <div className="pack-body relative flex flex-1 flex-col items-center justify-center gap-1 px-2">
          <div className="pack-holo pointer-events-none absolute inset-0" />
          <div className="pack-sheen pointer-events-none absolute inset-0" />
          {artUrl ? (
            <img src={artUrl} alt="" className="w-3/5 drop-shadow-[0_4px_12px_rgba(255,255,255,0.35)]" loading="lazy" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-1/3 drop-shadow" aria-hidden>
              <circle cx="12" cy="12" r="11" fill="oklch(0.97 0.01 250)" stroke="oklch(0.24 0.04 260)" strokeWidth="1.6" />
              <path d="M1.6 12h20.8" stroke="oklch(0.24 0.04 260)" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3.4" fill="oklch(0.97 0.01 250)" stroke="oklch(0.24 0.04 260)" strokeWidth="1.4" />
            </svg>
          )}
          <p className="font-display text-[clamp(0.75rem,1.5vw,1.05rem)] font-black uppercase italic leading-none tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Poke <span className="text-poke-yellow">Pack</span>
          </p>
          <p className="mono-num text-[0.55rem] font-bold uppercase tracking-[0.25em] text-white/80">
            {label}
          </p>
        </div>
        {/* crimped foil bottom */}
        <div className="pack-crimp h-[8%] w-full" />
        {/* glossy top-light */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-white/25 via-transparent to-black/20" />
      </div>
    </div>
  );
}
