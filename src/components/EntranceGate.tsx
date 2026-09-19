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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#060b18] ${
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
        {/* Poké Ball */}
        <span className="relative mb-12 block">
          {/* hover glow ring */}
          <span className="absolute -inset-6 rounded-full bg-white/5 blur-2xl transition-colors duration-1000 group-hover:bg-poke-yellow/10" />
          <span
            className={`relative block h-44 w-44 overflow-hidden rounded-full border-[10px] border-[#0a0f1e] shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
              opening ? "ball-shake" : "animate-bounce [animation-duration:3s]"
            }`}
          >
            <span
              className={`absolute top-0 h-1/2 w-full bg-gradient-to-b from-[#ff1c1c] to-[#c40000] transition-transform duration-700 ${
                opening ? "-translate-y-[130%] -rotate-12" : ""
              }`}
            />
            <span
              className={`absolute bottom-0 h-1/2 w-full bg-gradient-to-t from-[#f0f0f0] to-white transition-transform duration-700 ${
                opening ? "translate-y-[130%] rotate-12" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 h-4 w-full -translate-y-1/2 bg-[#0a0f1e] transition-opacity duration-500 ${
                opening ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0a0f1e] shadow-lg transition-all duration-500 ${
                opening ? "scale-0 opacity-0" : ""
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-[6px] border-[#0a0f1e] bg-white">
                <span className="h-2 w-2 rounded-full bg-slate-200" />
              </span>
            </span>
            {/* burst */}
            <span className={`absolute inset-0 rounded-full ${opening ? "gate-burst" : "hidden"}`} />
          </span>
        </span>

        {/* Wordmark with glow */}
        <span className="relative mb-10 block">
          <span className="block font-display text-8xl tracking-tighter text-poke-yellow">
            POKE
          </span>
          <span
            aria-hidden
            className="absolute inset-0 select-none font-display text-8xl tracking-tighter text-poke-yellow opacity-30 blur-xl"
          >
            POKE
          </span>
        </span>

        {/* CTA */}
        <span className="relative block">
          <span className="absolute -inset-1 animate-pulse rounded-full bg-poke-yellow/30 blur-md transition duration-300 group-hover:bg-poke-yellow/50" />
          <span className="relative block rounded-full bg-poke-yellow px-14 py-4 text-xl font-black uppercase tracking-[0.2em] text-[#060b18] shadow-2xl transition-all group-hover:brightness-110 group-active:scale-95">
            Tap to Enter
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={enter}
        className="absolute bottom-8 z-10 font-mono text-xs uppercase tracking-widest text-blue-400/30 transition-colors hover:text-blue-400/70"
      >
        System Ready • Awaiting Trainer
      </button>
    </div>
  );
}
