import { useEffect, useState } from "react";

const KEY = "poke-entered";

export function EntranceGate() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(KEY) !== "1") setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  function enter() {
    if (opening) return;
    setOpening(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(() => setShow(false), 1250);
  }

  if (!mounted || !show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-poke-navy-deep ${
        opening ? "gate-leaving" : ""
      }`}
    >
      {/* background glow + rings */}
      <div className="pointer-events-none absolute inset-0 gate-aurora" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="gate-ring" style={{ animationDelay: "0s" }} />
        <span className="gate-ring" style={{ animationDelay: "1.1s" }} />
        <span className="gate-ring" style={{ animationDelay: "2.2s" }} />
      </div>

      <button
        type="button"
        onClick={enter}
        aria-label="Enter Poke"
        className="group relative z-10 flex flex-col items-center focus:outline-none"
      >
        {/* Poké Ball */}
        <span
          className={`relative block h-40 w-40 ${opening ? "ball-shake" : "ball-float"} sm:h-48 sm:w-48`}
        >
          <span className="absolute inset-0 rounded-full shadow-[0_0_90px_20px_oklch(0.55_0.2_27/0.35)]" />
          <span
            className={`absolute inset-x-0 top-0 h-1/2 rounded-t-full border-4 border-b-0 border-poke-navy-deep bg-poke-red transition-transform duration-700 ${
              opening ? "-translate-y-[130%] rotate-[-16deg]" : ""
            }`}
          />
          <span
            className={`absolute inset-x-0 bottom-0 h-1/2 rounded-b-full border-4 border-t-0 border-poke-navy-deep bg-white transition-transform duration-700 ${
              opening ? "translate-y-[130%] rotate-[16deg]" : ""
            }`}
          />
          <span
            className={`absolute left-0 right-0 top-1/2 h-[8px] -translate-y-1/2 bg-poke-navy-deep transition-opacity duration-500 ${
              opening ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-poke-navy-deep bg-white transition-all duration-500 group-hover:bg-poke-yellow ${
              opening ? "scale-0 opacity-0" : ""
            }`}
          />
          {/* burst */}
          <span className={`absolute inset-0 rounded-full ${opening ? "gate-burst" : "hidden"}`} />
        </span>

        <span className="mt-9 block font-display text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_0_oklch(0.55_0.2_27)] sm:text-7xl">
          POKE
        </span>
        <span className="mt-2 block max-w-xs text-center text-sm text-white/70">
          One name. One card. Forever.
        </span>

        <span className="poke-btn mt-8 gate-pulse">Tap the ball to enter</span>
      </button>

      <button
        type="button"
        onClick={enter}
        className="absolute bottom-6 z-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 hover:text-white/80"
      >
        Skip
      </button>
    </div>
  );
}
