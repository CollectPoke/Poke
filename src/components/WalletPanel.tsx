import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { exportMyPrivateKey, getMyWallet, withdrawSol } from "@/lib/wallet.functions";

function Copy({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="rounded-lg border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary"
    >
      {done ? "Copied!" : label}
    </button>
  );
}

export function WalletPanel() {
  const qc = useQueryClient();
  const fetchWallet = useServerFn(getMyWallet);
  const exportKey = useServerFn(exportMyPrivateKey);
  const withdraw = useServerFn(withdrawSol);

  const [showKey, setShowKey] = useState<string | null>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wallet = useQuery({ queryKey: ["my-wallet"], queryFn: () => fetchWallet({ data: undefined }) });

  const reveal = useMutation({
    mutationFn: () => exportKey({ data: undefined }),
    onSuccess: (r) => setShowKey(r.privateKey),
    onError: (e) => setError(e instanceof Error ? e.message : "Could not show the key."),
  });

  const send = useMutation({
    mutationFn: () => withdraw({ data: { to: to.trim(), amount: Number(amount) } }),
    onSuccess: (r) => {
      setSent(r.signature);
      setError(null);
      setTo("");
      setAmount("");
      void qc.invalidateQueries({ queryKey: ["my-wallet"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "The transfer failed."),
  });

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_10px_40px_-15px_oklch(0.24_0.045_260/0.25)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Your Poke wallet</h2>
          <p className="text-sm text-muted-foreground">
            Built into your account — no wallet app needed. Send SOL to the address below to top it up.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-poke-yellow/50 bg-poke-yellow/15 px-5 py-3 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Balance</p>
          <p className="mono-num text-2xl font-extrabold text-foreground">
            {wallet.isLoading ? "…" : `${(wallet.data?.balance ?? 0).toFixed(4)} SOL`}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Deposit address
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <code className="mono-num break-all text-sm font-semibold text-foreground">
            {wallet.data?.address ?? "Creating your wallet…"}
          </code>
          {wallet.data ? <Copy value={wallet.data.address} label="Copy address" /> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Withdraw */}
        <div className="rounded-2xl border border-border p-4">
          <p className="font-display text-lg font-bold text-foreground">Send SOL out</p>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Destination Solana address"
            className="mt-3 w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm outline-none focus:border-poke-blue"
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="mono-num w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm outline-none focus:border-poke-blue"
            />
            <span className="rounded-lg bg-poke-navy px-2.5 py-1.5 text-xs font-bold text-white">SOL</span>
          </div>
          <button
            onClick={() => send.mutate()}
            disabled={send.isPending || !to || !amount}
            className="poke-btn mt-3 w-full justify-center disabled:opacity-50"
          >
            {send.isPending ? "Sending…" : "Send"}
          </button>
          {sent ? (
            <a
              href={`https://solscan.io/tx/${sent}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block break-all text-xs font-bold text-poke-blue underline"
            >
              Sent — view on Solscan
            </a>
          ) : null}
        </div>

        {/* Export */}
        <div className="rounded-2xl border border-border p-4">
          <p className="font-display text-lg font-bold text-foreground">Export private key</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This key controls all the SOL in your Poke wallet. Anyone who sees it can take your funds —
            never share it, and never show it on stream.
          </p>
          {showKey ? (
            <div className="mt-3">
              <code className="mono-num block break-all rounded-xl border-2 border-poke-red/40 bg-poke-red/10 p-3 text-xs font-semibold text-foreground">
                {showKey}
              </code>
              <div className="mt-2 flex gap-2">
                <Copy value={showKey} label="Copy key" />
                <button
                  onClick={() => setShowKey(null)}
                  className="rounded-lg border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-secondary"
                >
                  Hide
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => reveal.mutate()}
              disabled={reveal.isPending}
              className="mt-3 w-full rounded-xl border-2 border-poke-red/40 bg-poke-red/10 px-4 py-2.5 text-sm font-bold text-poke-red transition-colors hover:bg-poke-red/20 disabled:opacity-50"
            >
              {reveal.isPending ? "Loading…" : "Show my private key"}
            </button>
          )}
        </div>
      </div>

      {error ? <p className="mt-4 text-sm font-bold text-poke-red">{error}</p> : null}
    </section>
  );
}
