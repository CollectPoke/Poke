import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { PokeCard } from "@/components/PokeCard";
import { useAuth } from "@/lib/auth";
import { myMintedCards } from "@/lib/queries";
import { listPairings, pokemonArtwork, type PairingRow } from "@/lib/pairings";
import { CARD_TYPES, RARITIES, formatPokeCoin, rarityStyle } from "@/lib/cards";

export const Route = createFileRoute("/_authenticated/gallery")({
  head: () => ({
    meta: [
      { title: "My gallery · Poke" },
      { name: "description", content: "Every card you minted on Poke, with artwork, rarity and its Pokémon pairing." },
      { property: "og:title", content: "My gallery · Poke" },
      {
        property: "og:description",
        content: "Every card you minted on Poke, with artwork, rarity and its Pokémon pairing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [rarity, setRarity] = useState<string>("all");
  const [cardType, setCardType] = useState<string>("all");
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "price-desc" | "price-asc">("newest");

  const { data: cards, isLoading } = useQuery({
    queryKey: ["my-minted", userId],
    queryFn: () => myMintedCards(userId),
    enabled: !!userId,
  });

  const { data: pairings } = useQuery({ queryKey: ["pairings"], queryFn: () => listPairings(200) });

  const pairingFor = useMemo(() => {
    const byKey = new Map<string, PairingRow>();
    for (const p of pairings ?? []) {
      byKey.set(p.coin_name.trim().toLowerCase(), p);
      byKey.set(p.coin_symbol.trim().toLowerCase(), p);
    }
    return (name: string, ticker: string) =>
      byKey.get(name.trim().toLowerCase()) ?? byKey.get(ticker.trim().toLowerCase()) ?? null;
  }, [pairings]);

  const shown = (cards ?? []).filter((c) => {
    if (rarity !== "all" && c.rarity !== rarity) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return c.name.toLowerCase().includes(needle) || c.ticker.toLowerCase().includes(needle);
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold text-poke-navy sm:text-4xl">My gallery</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every card you have minted, with its artwork, rarity and the Pokémon it was paired with.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your cards…"
          className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-sm font-medium outline-none focus:border-poke-blue sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Chip active={rarity === "all"} onClick={() => setRarity("all")}>
            All rarities
          </Chip>
          {RARITIES.map((r) => (
            <Chip key={r} active={rarity === r} onClick={() => setRarity(r)}>
              {r}
            </Chip>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading your gallery…</p>
      ) : shown.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-poke-navy/20 bg-card p-12 text-center">
          <p className="font-display text-xl font-bold text-poke-navy">Nothing here yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Mint a card and it shows up here with its artwork and pairing.
          </p>
          <Link to="/mint" className="poke-btn mt-5 inline-block">
            Mint a card
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {shown.map((card) => {
            const pair = pairingFor(card.name, card.ticker);
            const art = pokemonArtwork(pair?.pokedex_id ?? null);
            return (
              <div
                key={card.id}
                className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:flex-row"
              >
                <Link
                  to="/card/$cardId"
                  params={{ cardId: card.id }}
                  className="w-full shrink-0 transition-transform duration-300 hover:-translate-y-1 sm:w-48"
                >
                  <PokeCard card={card} compact />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${rarityStyle(card.rarity)}`}>
                      {card.rarity}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-poke-navy">
                      {card.card_type}
                    </span>
                    {card.status !== "minted" && (
                      <span className="rounded-full bg-poke-red/15 px-2.5 py-1 text-[11px] font-bold text-poke-red">
                        Burned
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 font-display text-2xl font-bold text-poke-navy">
                    {card.name} <span className="text-muted-foreground">${card.ticker}</span>
                  </h2>

                  <dl className="mono-num mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Listed at</dt>
                      <dd className="text-poke-navy">
                        {card.list_price !== null ? `${formatPokeCoin(card.list_price)} SOL` : "Not for sale"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last sale</dt>
                      <dd className="text-poke-navy">
                        {card.last_price !== null ? `${formatPokeCoin(card.last_price)} SOL` : "—"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-2xl border border-border bg-secondary/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Pokémon pairing
                    </p>
                    {pair ? (
                      <div className="mt-2 flex items-start gap-3">
                        {art && (
                          <img src={art} alt={pair.pokemon_name} className="size-16 shrink-0 object-contain" />
                        )}
                        <div className="min-w-0">
                          <p className="font-display text-lg font-bold capitalize text-poke-navy">
                            {pair.pokemon_name}
                            {pair.pokedex_id ? (
                              <span className="mono-num ml-2 text-sm text-muted-foreground">
                                #{String(pair.pokedex_id).padStart(3, "0")}
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{pair.explanation}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        No pairing yet.{" "}
                        <Link to="/pair" className="font-bold text-poke-blue underline">
                          Pair this coin
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
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
      onClick={onClick}
      className={`rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "border-poke-navy bg-poke-navy text-poke-yellow"
          : "border-border bg-card text-poke-navy hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
