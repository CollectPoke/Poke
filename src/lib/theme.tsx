import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "poke-theme";

type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const Ctx = createContext<ThemeCtx>({ theme: "light", setTheme: () => {}, toggle: () => {} });

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    let initial: Theme = "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        initial = stored;
      } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        initial = "dark";
      }
    } catch {
      /* ignore */
    }
    setThemeState(initial);
    apply(initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    apply(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      apply(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}

/** Day / night switch styled like a Poké Ball sliding between sun and moon. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      title={isDark ? "Day mode" : "Night mode"}
      className={`relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full border border-white/20 px-1 transition-colors ${
        isDark ? "bg-poke-navy-deep" : "bg-white/15"
      } ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-[13px] leading-none">
        <span className={isDark ? "opacity-35" : "opacity-100"} aria-hidden="true">
          ☀️
        </span>
        <span className={isDark ? "opacity-100" : "opacity-35"} aria-hidden="true">
          🌙
        </span>
      </span>
      <span
        className="relative h-7 w-7 rounded-full border-2 border-poke-navy-deep shadow-md transition-transform duration-300 ease-out"
        style={{
          transform: isDark ? "translateX(2.1rem)" : "translateX(0)",
          background:
            "linear-gradient(to bottom, var(--color-poke-red) 0 48%, oklch(0.2 0.03 260) 48% 52%, oklch(0.98 0 0) 52% 100%)",
        }}
      >
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-poke-navy-deep bg-white" />
      </span>
    </button>
  );
}
