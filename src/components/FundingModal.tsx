import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getMyWallet } from "@/lib/wallet.functions";

export const LAUNCH_COST_SOL = 0.1;

export function FundingModal({
  requiredSol = LAUNCH_COST_SOL,
  autoLaunch = false,
  onClose,
  onFunded,
}: {
  requiredSol?: number;
  autoLaunch?: boolean;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Top up your JPEG wallet"
    >
      <div className="w-full max-w-md border border-foreground bg-background p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Wallet funding</p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {funded ? "You're funded!" : "Add SOL to mint"}
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="size-8 shrink-0 rounded-none shadow-none"
          >
            ✕
          </Button>
        </div>

        {funded ? (
          <div className="mt-5 border border-foreground bg-muted p-4 text-center">
            <p className="text-2xl">✓</p>
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
              <Button
                type="button"
                variant="outline"
                onClick={copyAddress}
                className="h-auto w-full whitespace-normal rounded-none px-3 py-2.5 text-center shadow-none hover:border-foreground"
              >
                <span className="block break-all font-mono text-xs text-foreground">
                  {data?.address ?? "…"}
                </span>
                <span className="mt-1 block text-xs font-bold text-foreground">
                  {copied ? "Address copied!" : "Tap to copy"}
                </span>
              </Button>

              <div className="w-full border-y border-border bg-muted px-4 py-3 text-sm">
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
                <span className="pulse inline-block size-2 rounded-full bg-foreground" />
                Watching for your deposit — updates automatically
              </p>
            </div>
          </>
        )}

        {funded && (
          <Button type="button" onClick={onClose} className="mt-5 h-12 w-full rounded-none">
            Back to minting
          </Button>
        )}
      </div>
    </div>
  );
}
