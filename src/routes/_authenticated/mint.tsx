import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { ArtworkDrop } from "@/components/ArtworkDrop";
import { FundingModal, LAUNCH_COST_SOL } from "@/components/FundingModal";
import { MintReveal } from "@/components/MintReveal";
import { PokeCard } from "@/components/PokeCard";
import { useAuth } from "@/lib/auth";
import type { CardWithPeople } from "@/lib/cards";
import { launchCoinAndMintCard } from "@/lib/launch.functions";
import { isNameAvailable } from "@/lib/queries";
import { getMyWallet } from "@/lib/wallet.functions";

export const Route = createFileRoute("/_authenticated/mint")({
  head: () => ({
    meta: [
      { title: "Mint a card · Poke" },
      {
        name: "description",
        content: "Launch a coin as a one-of-one Poke card. Each name can only exist once.",
      },
      { property: "og:title", content: "Mint a card · Poke" },
      {
        property: "og:description",
        content: "Launch a coin as a one-of-one Poke card. Each name can only exist once.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MintPage,
});

function MintPage() {
  const navigate = useNavigate();
  const { user, username } = useAuth();

  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintedCard, setMintedCard] = useState<CardWithPeople | null>(null);
  const [launchSignature, setLaunchSignature] = useState<string | null>(null);
  const [showFunding, setShowFunding] = useState(false);
  const launchCoin = useServerFn(launchCoinAndMintCard);
  const fetchWallet = useServerFn(getMyWallet);

  const { data: wallet } = useQuery({
    queryKey: ["my-wallet"],
    queryFn: fetchWallet,
    refetchInterval: 8000,
  });
  const underfunded = wallet !== undefined && wallet.balance < LAUNCH_COST_SOL;

  // Pop the funding window as soon as we know the balance is too low.
  useEffect(() => {
    if (underfunded) setShowFunding(true);
  }, [underfunded]);

  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        setAvailable(await isNameAvailable(trimmed));
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [name]);

  const preview: CardWithPeople = {
    id: "preview",
    name: name.trim() || "Your card",
    name_key: "",
    ticker: ticker.trim().toUpperCase() || "TICKER",
    description: description || null,
    image_url: imageUrl || null,
    contract_address: "PokeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    creator_id: "",
    owner_id: "",
    status: "minted",
    list_price: listPrice ? Number(listPrice) : null,
    last_price: null,
    mint_price: 1,
    created_at: new Date().toISOString(),
    owner: { username: username ?? "you" },
  };

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (underfunded) {
      setShowFunding(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await launchCoin({ data: {
        name,
        ticker,
        description,
        imageUrl,
        listPrice: listPrice ? Number(listPrice) : null,
      } });
      setMintedCard({
        ...result.card,
        owner: { username: username ?? "you" },
      });
      setLaunchSignature(result.signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mint the card.");
    } finally {
      setBusy(false);
    }
  }

  const canMint =
    !!name.trim() && !!ticker.trim() && !!imageUrl.trim() && available === true && !busy;

  return (
    <>
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl font-bold">Mint a card</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Every mint launches a real Pump.fun coin on Solana and becomes a card. Once
        "Dog" is minted, nobody else can ever mint Dog — unless the holder burns it.
      </p>

      {underfunded && (
        <button
          type="button"
          onClick={() => setShowFunding(true)}
          className="mt-5 flex w-full items-start gap-3 rounded-2xl border-2 border-poke-red bg-poke-red/10 p-4 text-left shadow-sm transition-colors hover:border-poke-red/70"
        >
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-poke-red font-bold text-white">!</span>
          <div>
            <p className="text-sm font-bold">
              Your wallet needs SOL — balance {wallet.balance.toFixed(4)} SOL
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Launching costs up to {LAUNCH_COST_SOL} SOL. Tap here to see your deposit address and QR code.
            </p>
          </div>
        </button>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-poke-yellow bg-card p-4 shadow-sm">
        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-poke-yellow font-bold text-poke-yellow-foreground">◎</span>
        <div>
          <p className="text-sm font-bold">Real mainnet launch · 0.1 SOL maximum</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Your Poke wallet signs the Pump.fun launch. The card appears only after Solana confirms it. Mainnet spending is irreversible.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleMint} className="space-y-5">
          <Field label="Card name" hint="Permanent and unique">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dog"
              maxLength={32}
              className={inputClass}
            />
            {name.trim() && (
              <p className="mt-1.5 text-xs font-semibold">
                {checking ? (
                  <span className="text-muted-foreground">Checking availability…</span>
                ) : available === true ? (
                  <span className="text-poke-green">"{name.trim()}" is available.</span>
                ) : available === false ? (
                  <span className="text-poke-red">"{name.trim()}" is already taken.</span>
                ) : null}
              </p>
            )}
          </Field>

          <Field label="Ticker">
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="DOG"
              maxLength={10}
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this coin about?"
              className={inputClass}
            />
          </Field>

          <Field label="Image">
            {user && <ArtworkDrop userId={user.id} onUploaded={setImageUrl} />}
          </Field>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">List for sale immediately</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Put the card straight on the market after minting.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={listPrice !== ""}
                onClick={() => setListPrice(listPrice === "" ? "1" : "")}
                className={[
                  "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                  listPrice !== "" ? "bg-poke-green" : "bg-border",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 size-6 rounded-full bg-white shadow transition-all",
                    listPrice !== "" ? "left-[22px]" : "left-0.5",
                  ].join(" ")}
                />
              </button>
            </div>
            {listPrice !== "" && (
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    placeholder="2.5"
                    className={`${inputClass} pr-14 font-mono`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    SOL
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Dev buy</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Buy your own coin at launch. The tokens land in your Poke wallet.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={devBuy}
                onClick={() => setDevBuy(!devBuy)}
                className={[
                  "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                  devBuy ? "bg-poke-green" : "bg-border",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 size-6 rounded-full bg-white shadow transition-all",
                    devBuy ? "left-[22px]" : "left-0.5",
                  ].join(" ")}
                />
              </button>
            </div>
            {devBuy && (
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step="0.005"
                    value={devBuyAmount}
                    onChange={(e) => setDevBuyAmount(e.target.value)}
                    placeholder="0.075"
                    className={`${inputClass} pr-14 font-mono`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    SOL
                  </span>
                </div>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Total from your wallet: <span className="font-mono font-semibold">{totalCost.toFixed(3)} SOL</span>{" "}
              ({devBuySol.toFixed(3)} dev buy + 0.025 fees)
            </p>
          </div>

          {error && <p className="text-sm font-medium text-poke-red">{error}</p>}

          <button type="submit" disabled={!canMint} className="poke-btn disabled:opacity-40">
            {busy ? "Launching on Pump.fun…" : `Launch coin + mint card · ${totalCost.toFixed(3)} SOL`}
          </button>
          {busy ? <p className="text-xs text-muted-foreground">Preparing, checking, signing and confirming your Solana launch. Keep this page open.</p> : null}
        </form>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Preview</p>
          <PokeCard card={preview} />
        </div>
      </div>
    </main>
    {showFunding ? (
      <FundingModal
        requiredSol={LAUNCH_COST_SOL}
        onClose={() => setShowFunding(false)}
        onFunded={() => setTimeout(() => setShowFunding(false), 1800)}
      />
    ) : null}
    {mintedCard && launchSignature ? (
      <MintReveal card={mintedCard} signature={launchSignature} onContinue={() => navigate({ to: "/card/$cardId", params: { cardId: mintedCard.id } })} />
    ) : null}
    </>
  );
}

const inputClass =
  "w-full rounded-xl border-2 border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-poke-blue";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

