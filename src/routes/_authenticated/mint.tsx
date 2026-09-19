import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ArtworkDrop } from "@/components/ArtworkDrop";
import { PokeCard } from "@/components/PokeCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  CARD_TYPES,
  RARITIES,
  generateContractAddress,
  type CardWithPeople,
} from "@/lib/cards";
import { isNameAvailable } from "@/lib/queries";

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
  const [cardType, setCardType] = useState<string>("Fire");
  const [rarity, setRarity] = useState<string>("Common");
  const [hp, setHp] = useState(60);
  const [imageUrl, setImageUrl] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    card_type: cardType,
    rarity,
    hp,
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
    setBusy(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("cards")
        .insert({
          name: name.trim(),
          name_key: name.trim().toLowerCase(),
          ticker: ticker.trim().toUpperCase(),
          description: description.trim() || null,
          card_type: cardType,
          rarity,
          hp,
          image_url: imageUrl.trim() || null,
          contract_address: generateContractAddress(),
          creator_id: user.id,
          owner_id: user.id,
          list_price: listPrice ? Number(listPrice) : null,
        })
        .select("id")
        .single();
      if (err) {
        if (err.code === "23505") {
          setAvailable(false);
          throw new Error(`"${name.trim()}" has already been minted. Only one can ever exist.`);
        }
        throw err;
      }
      // The mint (and initial listing) event is recorded by the database itself.
      navigate({ to: "/card/$cardId", params: { cardId: data.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mint the card.");
    } finally {
      setBusy(false);
    }
  }

  const canMint = !!name.trim() && !!ticker.trim() && available === true && !busy;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl font-bold">Mint a card</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Every coin launched on Poke becomes a card, and a name can only exist once. Once
        "Dog" is minted, nobody else can ever mint Dog — unless the holder burns it.
      </p>

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

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ticker">
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="DOG"
                maxLength={10}
                className={inputClass}
              />
            </Field>
            <Field label="HP">
              <input
                type="number"
                min={10}
                max={340}
                value={hp}
                onChange={(e) => setHp(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this coin about?"
              className={inputClass}
            />
          </Field>

          <Field label="Artwork" hint="Optional — drop any image in">
            {user && <ArtworkDrop userId={user.id} onUploaded={setImageUrl} />}
          </Field>

          <Field label="Type">
            <div className="flex flex-wrap gap-2">
              {CARD_TYPES.map((t) => (
                <Chip key={t} active={cardType === t} onClick={() => setCardType(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Rarity">
            <div className="flex flex-wrap gap-2">
              {RARITIES.map((r) => (
                <Chip key={r} active={rarity === r} onClick={() => setRarity(r)}>
                  {r}
                </Chip>
              ))}
            </div>
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

          {error && <p className="text-sm font-medium text-poke-red">{error}</p>}

          <button type="submit" disabled={!canMint} className="poke-btn disabled:opacity-40">
            {busy ? "Minting…" : "Mint this card"}
          </button>
        </form>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Preview</p>
          <PokeCard card={preview} />
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-poke-blue";

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

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "border-poke-navy bg-poke-navy text-white"
          : "border-border bg-card hover:bg-secondary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
