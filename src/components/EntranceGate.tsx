import { useEffect, useState } from "react";

import pigMascot from "@/assets/pig-mascot.png";

const KEY = "poke-entered";

// Always rendered (including in the server HTML). Visibility is controlled by
// the `gate-active` class on <html>, which an inline script in <head> sets
// before first paint — so the page underneath is never visible until entering.
export function EntranceGate() {
  const [show, setShow] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let already = false;
    try {
      already = sessionStorage.getItem(KEY) === "1";
    } catch {
      already = false;
    }
    if (already) {
      setShow(false);
      document.documentElement.classList.remove("gate-active");
    }
  }, []);

  useEffect(() => {
    if (!show) document.documentElement.classList.remove("gate-active");
  }, [show]);

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
    window.dispatchEvent(new Event("poke:enter"));
    window.setTimeout(() => setShow(false), 1250);
  }

  return (
    <div
      className={`gate-overlay fixed inset-0 z-[100] flex-col items-center justify-center overflow-hidden px-6 bg-[#060b18] ${
        opening ? "gate-leaving" : ""
      }`}
    >
      {/* background energy */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-poke-yellow/5 blur-[80px]" />
      </div>

      <button
        type="button"
        onClick={enter}
        aria-label="Enter Poke"
        className="group relative z-10 flex flex-col items-center focus:outline-none"
      >
        {/* The jpeg frame */}
        <span className="relative mb-8 block sm:mb-12">
          <span className="absolute -inset-6 rounded-3xl bg-white/5 blur-2xl transition-colors duration-1000 group-hover:bg-poke-yellow/15" />
          <span
            className={`relative block h-36 w-36 overflow-hidden rounded-2xl border-[6px] border-poke-yellow bg-white shadow-[0_0_60px_rgba(0,0,0,0.55)] sm:h-48 sm:w-48 ${
              opening ? "scale-110 opacity-0 transition-all duration-700" : "animate-bounce [animation-duration:3s]"
            }`}
          >
            <img
              src={pigMascot}
              alt=""
              width={816}
              height={816}
              className="h-full w-full object-contain p-2"
            />
            <span className="mono-num absolute bottom-0 left-0 right-0 bg-poke-navy/90 py-1 text-center text-[10px] uppercase tracking-[0.2em] text-poke-yellow">
              1 of 1
            </span>
          </span>
        </span>

        {/* Wordmark with glow */}
        <span className="relative mb-10 block">
          <span className="block font-display text-6xl tracking-tighter text-poke-yellow sm:text-8xl">
            POKE
          </span>
          <span
            aria-hidden
            className="absolute inset-0 select-none font-display text-6xl tracking-tighter text-poke-yellow opacity-30 blur-xl sm:text-8xl"
          >
            POKE
          </span>
        </span>

        {/* CTA */}
        <span className="relative block">
          <span className="absolute -inset-1 animate-pulse rounded-full bg-poke-yellow/30 blur-md transition duration-300 group-hover:bg-poke-yellow/50" />
          <span className="relative block rounded-full bg-poke-yellow px-9 py-3.5 text-base font-black uppercase tracking-[0.2em] text-[#060b18] shadow-2xl transition-all group-hover:brightness-110 group-active:scale-95 sm:px-14 sm:py-4 sm:text-xl">
            Tap to Enter
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={enter}
        className="absolute bottom-8 z-10 font-mono text-xs uppercase tracking-widest text-blue-400/30 transition-colors hover:text-blue-400/70"
      >
        System Ready • Awaiting Collector
      </button>
    </div>
  );
}
