import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

const MUTE_KEY = "poke-music-muted";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio("/poke-theme.mp3");
    audio.loop = true;
    audio.volume = 0.18;
    audioRef.current = audio;

    const isMuted = () => {
      try {
        return localStorage.getItem(MUTE_KEY) === "1";
      } catch {
        return false;
      }
    };

    const stop = () => {
      window.removeEventListener("poke:enter", tryPlay);
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
    };

    // Music is on by default. Try straight away, and keep retrying on every
    // interaction until it actually starts (browsers need a real tap first).
    // Once the user turns it off, we stop trying.
    function tryPlay() {
      if (isMuted()) {
        stop();
        return;
      }
      if (!audio.paused) return;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          stop();
        })
        .catch(() => setPlaying(false));
    }

    tryPlay();
    window.addEventListener("poke:enter", tryPlay);
    window.addEventListener("pointerdown", tryPlay);
    window.addEventListener("keydown", tryPlay);
    window.addEventListener("touchstart", tryPlay);
    return () => {
      stop();
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      try {
        localStorage.setItem(MUTE_KEY, "1");
      } catch {
        /* ignore */
      }
    } else {
      audio
        .play()
        .then(() => {
          setPlaying(true);
          try {
            localStorage.setItem(MUTE_KEY, "0");
          } catch {
            /* ignore */
          }
        })
        .catch(() => setPlaying(false));
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Mute music" : "Play music"}
      title={playing ? "Mute music" : "Play music"}
      className="fixed bottom-5 right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#0a0f1e] bg-gradient-to-b from-[#ff1c1c] from-50% to-white to-50% shadow-lg transition-transform hover:scale-110 active:scale-95"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0a0f1e] bg-white">
        {playing ? (
          <Music className="h-3.5 w-3.5 text-[#0a0f1e]" />
        ) : (
          <VolumeX className="h-3.5 w-3.5 text-[#0a0f1e]" />
        )}
      </span>
      {playing && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-poke-yellow opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-poke-yellow" />
        </span>
      )}
    </button>
  );
}
