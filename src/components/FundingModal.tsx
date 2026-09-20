import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

import { getMyWallet } from "@/lib/wallet.functions";

export const LAUNCH_COST_SOL = 0.1;

export function FundingModal({
  requiredSol = LAUNCH_COST_SOL,
  onClose,
  onFunded,
}: {
  requiredSol?: number;
  onClose: () => void;
  onFunded?: () => void;
}) {
  const fetchWallet = useServerFn(getMyWallet);
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["my-wallet"],
    queryFn: fetchWallet,
    refetchInterval: 4000,
  });

  const balance = data?.balance ?? null;
  const funded = balance !== null && balance >= requiredSol;
  const missing = balance !== null ? Math.max(0, requiredSol - balance) : null;

  useEffect(() => {
    if (funded && onFunded) onFunded();
  }, [funded, onFunded]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function copyAddress() {
    if (!data?.address) return;
    try {
      await navigator.clipboard.writeText(data.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Top up your JPEG wallet"
    >
      <div className="w-full max-w-md rounded-2xl border-2 border-brand bg-card p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-link">Top up</p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {funded ? "You're funded!" : "Add SOL to mint"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {funded ? (
          <div className="mt-5 rounded-xl border-2 border-success/40 bg-success/10 p-4 text-center">
            <p className="text-3xl">✅</p>
            <p className="mt-2 text-sm font-bold text-foreground">
              {balance?.toFixed(4)} SOL received
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your wallet has enough to launch. You're good to go.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Launching costs up to <strong className="text-foreground">{requiredSol} SOL</strong>.
              Send SOL to your personal JPEG deposit address below — the moment it lands, this
              window closes itself.
            </p>

            <div className="mt-5 flex flex-col items-center gap-4">
              <div className="rounded-xl border border-border bg-white p-3">
                {data?.address ? (
                  <QRCode value={data.address} size={168} />
                ) : (
                  <div className="flex size-[168px] items-center justify-center text-xs text-muted-foreground">
                    Loading address…
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={copyAddress}
                className="w-full rounded-xl border-2 border-border bg-secondary/50 px-3 py-2.5 text-center transition-colors hover:border-link"
              >
                <span className="block break-all font-mono text-xs text-foreground">
                  {data?.address ?? "…"}
                </span>
                <span className="mt-1 block text-xs font-bold text-link">
                  {copied ? "Address copied!" : "Tap to copy"}
                </span>
              </button>

              <div className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Your balance</span>
                  <span className="mono-num font-bold text-foreground">
                    {balance === null ? "…" : `${balance.toFixed(4)} SOL`}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">Still needed</span>
                  <span className="mono-num font-bold text-danger">
                    {missing === null ? "…" : `${missing.toFixed(4)} SOL`}
                  </span>
                </div>
              </div>

              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="pulse inline-block size-2 rounded-full bg-brand" />
                Watching for your deposit — updates automatically
              </p>
            </div>
          </>
        )}

        {funded && (
          <button type="button" onClick={onClose} className="primary-btn mt-5 w-full">
            Back to minting
          </button>
        )}
      </div>
    </div>
  );
}
