import { useEffect, useState } from "react";

/**
 * Full-screen celebration shown right after a new account is created.
 * A Poké Ball drops in, opens with a flash, and reveals a trainer card.
 */
export function WelcomeTrainer({ username, onDone }: { username: string; onDone: () => void }) {
  const [stage, setStage] = useState<"drop" | "open" | "card">("drop");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("open"), 900);
    const t2 = setTimeout(() => setStage("card"), 1500);
    const t3 = setTimeout(onDone, 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-poke-navy/95 backdrop-blur-sm">
      {/* sparkles */}
      {stage !== "drop" &&
        Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="welcome-spark"
            style={
              {
                left: `${(i * 53) % 100}%`,
                top: `${(i * 37) % 100}%`,
                animationDelay: `${(i % 6) * 0.15}s`,
              } as React.CSSProperties
            }
          />
        ))}

      {stage === "drop" && (
        <div className="welcome-ball-drop">
          <PokeBallSvg open={false} />
        </div>
      )}

      {stage === "open" && (
        <div className="relative">
          <div className="welcome-flash" />
          <div className="welcome-ball-open">
            <PokeBallSvg open />
          </div>
        </div>
      )}

      {stage === "card" && (
        <div className="welcome-card-pop mx-5 w-full max-w-sm rounded-3xl border-4 border-poke-yellow bg-gradient-to-br from-poke-blue to-poke-navy p-7 text-center shadow-2xl">
          <div className="mx-auto -mt-16 mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-poke-yellow bg-white shadow-lg">
            <PokeBallSvg open={false} small />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-poke-yellow">
            New trainer registered
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">
            Welcome, {username || "Trainer"}!
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Your very own Solana wallet is being forged. Time to mint your first card.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-poke-yellow px-4 py-1.5 text-xs font-bold text-poke-navy">
            <span className="h-2 w-2 animate-pulse rounded-full bg-poke-red" />
            Trainer card issued
          </div>
        </div>
      )}
    </div>
  );
}

function PokeBallSvg({ open, small }: { open: boolean; small?: boolean }) {
  const size = small ? 44 : 96;
  if (open) {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden>
        <g className="welcome-ball-top">
          <path d="M8 48a40 40 0 0 1 80 0z" fill="#e3350d" />
          <rect x="8" y="42" width="80" height="8" fill="#1b2a4a" />
        </g>
        <g className="welcome-ball-bottom">
          <path d="M8 48a40 40 0 0 0 80 0z" fill="#ffffff" />
          <rect x="8" y="46" width="80" height="8" fill="#1b2a4a" />
        </g>
        <circle cx="48" cy="48" r="10" fill="#ffffff" stroke="#1b2a4a" strokeWidth="4" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden>
      <circle cx="48" cy="48" r="40" fill="#ffffff" />
      <path d="M8 48a40 40 0 0 1 80 0z" fill="#e3350d" />
      <rect x="8" y="42" width="80" height="12" fill="#1b2a4a" />
      <circle cx="48" cy="48" r="11" fill="#ffffff" stroke="#1b2a4a" strokeWidth="5" />
      <circle cx="48" cy="48" r="4" fill="#1b2a4a" />
    </svg>
  );
}
