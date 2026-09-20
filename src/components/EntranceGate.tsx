import { useEffect, useRef, useState } from "react";

import pigAsset from "@/assets/pig.webp.asset.json";

const KEY = "jpeg-entered";

// Always rendered (including in the server HTML). Visibility is controlled by
// the `gate-active` class on <html>, which an inline script in <head> sets
// before first paint — so the page underneath is never visible until entering.
export function EntranceGate() {
  const [show, setShow] = useState(true);
  const [opening, setOpening] = useState(false);
  const closeTimer = useRef<number | null>(null);

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

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  function enter() {
    if (opening) return;
    setOpening(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("jpeg:enter"));
    closeTimer.current = window.setTimeout(() => setShow(false), 1250);
  }

  return (
    <div
      className={`gate-overlay fixed inset-0 z-[100] flex-col items-center justify-center overflow-hidden bg-background px-6 ${
        opening ? "gate-leaving" : ""
      }`}
    >
      {/* background energy */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-6 border border-border sm:inset-10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-brand/40 to-transparent" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
      </div>

      <button
        type="button"
        onClick={enter}
        aria-label="Enter JPEG"
        className="group relative z-10 flex flex-col items-center focus:outline-none"
      >
        {/* The jpeg frame */}
        <span className="relative mb-8 block sm:mb-12">
          <span className="absolute -inset-6 bg-brand/10 blur-2xl transition-colors duration-1000 group-hover:bg-brand/20" />
          <span
            className={`relative block h-36 w-36 overflow-hidden border border-brand bg-surface shadow-card sm:h-48 sm:w-48 ${
              opening
                ? "scale-110 opacity-0 transition-all duration-700"
                : "animate-bounce [animation-duration:3s]"
            }`}
          >
            <img src={pigAsset.url} alt="" className="h-full w-full object-contain p-2" />
            <span className="mono-num absolute bottom-0 left-0 right-0 bg-foreground/90 py-1 text-center text-[10px] uppercase tracking-[0.2em] text-brand">
              1 of 1
            </span>
          </span>
        </span>

        {/* Wordmark with glow */}
        <span className="relative mb-10 block">
          <span className="block font-display text-6xl tracking-tighter text-brand sm:text-8xl">
            JPEG
          </span>
          <span
            aria-hidden
            className="absolute inset-0 select-none font-display text-6xl tracking-tighter text-brand opacity-30 blur-xl sm:text-8xl"
          >
            JPEG
          </span>
        </span>

        {/* CTA */}
        <span className="relative block">
           <span className="absolute -inset-1 animate-pulse bg-brand/30 blur-md transition duration-300 group-hover:bg-brand/50" />
           <span className="relative block border border-brand bg-brand px-9 py-3.5 text-base font-black uppercase tracking-[0.2em] text-brand-foreground shadow-2xl transition-all group-hover:brightness-110 group-active:scale-95 sm:px-14 sm:py-4 sm:text-xl">
             Enter Arena
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={enter}
        className="absolute bottom-8 z-10 font-mono text-xs uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-brand"
      >
        one jpeg · one coin · forever
      </button>
    </div>
  );
}
