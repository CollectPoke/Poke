import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";

import { ArtworkDrop } from "@/components/ArtworkDrop";
import { FundingModal } from "@/components/FundingModal";
import { MintReveal } from "@/components/MintReveal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import type { CardWithPeople } from "@/lib/cards";
import { launchCoinAndMintCard } from "@/lib/launch.functions";
import { isNameAvailable } from "@/lib/queries";
import { getMyWallet } from "@/lib/wallet.functions";

export const Route = createFileRoute("/_authenticated/mint")({
  head: () => ({
    meta: [
      { title: "Mint an NFT · JPEG" },
      {
        name: "description",
        content: "Launch a coin as a one-of-one JPEG. Each name can only exist once.",
      },
      { property: "og:title", content: "Mint an NFT · JPEG" },
      {
        property: "og:description",
        content: "Launch a coin as a one-of-one JPEG. Each name can only exist once.",
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
  const [pendingLaunch, setPendingLaunch] = useState(false);
  const launchingRef = useRef(false);
  const launchCoin = useServerFn(launchCoinAndMintCard);
  const fetchWallet = useServerFn(getMyWallet);

  const { data: wallet } = useQuery({
    queryKey: ["my-wallet"],
    queryFn: fetchWallet,
    refetchInterval: 8000,
  });
  const totalCost = 0.1;
  const underfunded = wallet !== undefined && wallet.balance < totalCost;

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
    name: name.trim() || "Your NFT",
    name_key: "",
    ticker: ticker.trim().toUpperCase() || "TICKER",
    description: description || null,
    image_url: imageUrl || null,
    contract_address: "JPEGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    creator_id: "",
    owner_id: "",
    status: "minted",
    list_price: listPrice ? Number(listPrice) : null,
    last_price: null,
    mint_price: 1,
    created_at: new Date().toISOString(),
    owner: { username: username ?? "you" },
  };

  const runLaunch = useCallback(async () => {
    if (launchingRef.current) return;
    launchingRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await launchCoin({
        data: {
          name,
          ticker,
          description,
          imageUrl,
          listPrice: listPrice ? Number(listPrice) : null,
          devBuySol: 0,
        },
      });
      setMintedCard({
        ...result.card,
        owner: { username: username ?? "you" },
      });
      setLaunchSignature(result.signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mint the NFT.");
    } finally {
      launchingRef.current = false;
      setBusy(false);
    }
  }, [launchCoin, name, ticker, description, imageUrl, listPrice, username]);

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (underfunded) {
      setPendingLaunch(true);
      setShowFunding(true);
      return;
    }
    await runLaunch();
  }

  // Auto-launch the moment the deposit lands, so the user never has to click twice.
  useEffect(() => {
    if (!pendingLaunch || underfunded || wallet === undefined) return;
    setPendingLaunch(false);
    setShowFunding(false);
    void runLaunch();
  }, [pendingLaunch, underfunded, wallet, runLaunch]);

  const canMint =
    !!name.trim() && !!ticker.trim() && !!imageUrl.trim() && available === true && !busy;

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
        <div className="border border-foreground bg-background">
          <header className="flex items-end justify-between gap-6 border-b border-foreground p-5 sm:p-7">
            <div>
              <h1 className="text-3xl font-bold uppercase leading-none tracking-normal sm:text-4xl">
                JPEG Launch
              </h1>
              <p className="mt-2 text-[11px] font-medium uppercase text-muted-foreground">
                One image. One NFT. One coin.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Network</p>
              <p className="mono-num mt-1 text-xs sm:text-sm">SOL / Mainnet</p>
            </div>
          </header>

          <form onSubmit={handleMint} className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-12 p-5 sm:p-8 lg:border-r lg:border-foreground">
              <section>
                <StepTitle number="01" title="Identity" />
                <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Claim a permanent name and launch its attached Pump.fun coin.
                </p>
                <div className="space-y-7">
                  <Field label="NFT name" hint="Permanent and unique">
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
                          <span className="text-success">"{name.trim()}" is available.</span>
                        ) : available === false ? (
                          <span className="text-danger">"{name.trim()}" is already taken.</span>
                        ) : null}
                      </p>
                    )}
                  </Field>

                  <div className="grid gap-7 sm:grid-cols-[160px_1fr]">
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
                        rows={1}
                        placeholder="What is this coin about?"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section className="border-t border-border pt-10">
                <StepTitle number="02" title="Sale settings" />
                <div className="flex items-center justify-between gap-4 border-y border-border py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">List for sale immediately</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Put the NFT straight on the market after minting.
                      </p>
                    </div>
                    <Button
                      type="button"
                      role="switch"
                      aria-checked={listPrice !== ""}
                      onClick={() => setListPrice(listPrice === "" ? "1" : "")}
                      variant="outline"
                      className={[
                        "relative h-7 w-12 shrink-0 rounded-full border-foreground p-0 shadow-none transition-colors hover:bg-muted",
                        listPrice !== "" ? "bg-foreground hover:bg-foreground/90" : "bg-background",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-0.5 size-5.5 rounded-full bg-background shadow transition-all",
                          listPrice !== "" ? "left-[22px]" : "left-0.5",
                        ].join(" ")}
                      />
                    </Button>
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
              </section>

              <section className="border-t border-border pt-10">
                <StepTitle number="03" title="Funding" />
                <div className="bg-foreground p-5 text-background">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-background/60">
                        Wallet balance
                      </p>
                      <p className="mono-num mt-1 text-2xl">
                        {wallet ? wallet.balance.toFixed(4) : "—"} SOL
                      </p>
                    </div>
                    <span className="mono-num text-[10px] uppercase text-background/70">
                      {underfunded ? "Funding required" : "Ready"}
                    </span>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-5 border-t border-background/20 pt-5">
                    <p className="max-w-sm text-xs leading-relaxed text-background/70">
                      Flat mainnet launch cost: {totalCost.toFixed(3)} SOL. Your personal JPEG
                      wallet signs the transaction.
                    </p>
                    {underfunded ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFunding(true)}
                        className="shrink-0 rounded-none border-background bg-transparent text-background shadow-none hover:bg-background hover:text-foreground"
                      >
                        Add SOL
                      </Button>
                    ) : null}
                  </div>
                </div>
              </section>

              {error && <p className="text-sm font-medium text-danger">{error}</p>}
            </div>

            <aside className="flex flex-col bg-muted/50 p-5 sm:p-8">
              <StepTitle number="04" title="Artwork" />
              {user && <ArtworkDrop userId={user.id} onUploaded={setImageUrl} />}
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xl font-bold">{preview.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">1 / 1 original</p>
                  </div>
                  <p className="mono-num shrink-0 text-xs font-bold">${preview.ticker}</p>
                </div>
                {preview.description ? (
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    {preview.description}
                  </p>
                ) : null}
              </div>
              <div className="mt-auto pt-10">
                <Button
                  type="submit"
                  disabled={!canMint}
                  className="h-16 w-full rounded-none bg-foreground text-xs font-bold uppercase text-background shadow-none hover:bg-foreground/85"
                >
                  {busy ? "Launching…" : `Launch · ${totalCost.toFixed(3)} SOL`}
                </Button>
                <p className="mt-3 text-center text-[10px] uppercase text-muted-foreground">
                  Final on Solana after confirmation
                </p>
              </div>
            </aside>
          </form>
        </div>
      </main>
      {showFunding ? (
        <FundingModal
          requiredSol={totalCost}
          onClose={() => setShowFunding(false)}
          onFunded={() => setShowFunding(false)}
        />
      ) : null}
      {mintedCard && launchSignature ? (
        <MintReveal
          card={mintedCard}
          signature={launchSignature}
          onContinue={() => navigate({ to: "/card/$cardId", params: { cardId: mintedCard.id } })}
        />
      ) : null}
    </>
  );
}

const inputClass =
  "w-full rounded-none border-0 border-b border-foreground bg-transparent px-0 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-b-2";

function StepTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-4">
      <span className="mono-num text-xs">{number}.</span>
      <h2 className="text-lg font-bold uppercase tracking-normal">{title}</h2>
    </div>
  );
}

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
      <label className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <span className="text-[10px] font-bold uppercase">{label}</span>
        {hint && <span className="text-[10px] uppercase text-muted-foreground">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
