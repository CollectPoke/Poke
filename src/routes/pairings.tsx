import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { RARITIES, formatPokeCoin, rarityStyle, typeStyle } from "@/lib/cards";
import { listPairings, pokemonArtwork, type PairingRow } from "@/lib/pairings";
import { listCards } from "@/lib/queries";

export const Route = createFileRoute("/pairings")({
  head: () => ({
    meta: [
      { title: "Pairing directory · Poke" },
      {
        name: "description",
        content:
          "Browse every memecoin paired with its Pokémon on Poke — typings, rarity, token stats and a link to each token page.",
      },
      { property: "og:title", content: "Pairing directory · Poke" },
      {
        property: "og:description",
        content:
          "Browse every memecoin paired with its Pokémon on Poke — typings, rarity, token stats and a link to each token page.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PairingsPage,
});

function PairingsPage() {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<string | null>(null);

  const pairingsQuery = useQuery({ queryKey: ["pairings"], queryFn: () => listPairings() });
  const cardsQuery = useQuery({ queryKey: ["cards"], queryFn: () => listCards() });

  const cardByName = useMemo(() => {
    const map = new Map<string, CardWithPeople>();
    for (const c of cardsQuery.data ?? []) map.set(c.name_key, c);
    return map;
  }, [cardsQuery.data]);

  const pairings = (pairingsQuery.data ?? []).filter((p) => {
    if (rarity && p.rarity !== rarity) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.coin_name.toLowerCase().includes(q) ||
      p.coin_symbol.toLowerCase().includes(q) ||
      p.pokemon_name.toLowerCase().includes(q)
    );
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-poke-navy">Pairing directory</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every memecoin the community has paired with a Pokémon — typing, rarity, the reasoning,
            and a link straight to the token&apos;s card when it has been minted.
          </p>
        </div>
        <Link to="/pair" className="poke-btn">
          Pair a coin
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coin, symbol or Pokémon"
          className="w-full max-w-xs rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-poke-blue"
        />
        <button
          onClick={() => setRarity(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${rarity === null ? "bg-poke-navy text-white" : "bg-muted text-muted-foreground"}`}
        >
          All rarities
        </button>
        {RARITIES.map((r) => (
          <button
            key={r}
            onClick={() => setRarity(rarity === r ? null : r)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${rarity === r ? rarityStyle(r) : "bg-muted text-muted-foreground"}`}
          >
            {r}
          </button>
        ))}
      </div>

      {pairingsQuery.isLoading ? (
        <p className="text-muted-foreground">Loading pairings…</p>
      ) : pairings.length === 0 ? (
        <div className="dex-card p-10 text-center">
          <p className="text-muted-foreground">
            No pairings yet. Be the first — pair your coin and it shows up here.
          </p>
          <Link to="/pair" className="poke-btn mt-4 inline-block">
            Pair a coin
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pairings.map((p) => (
            <PairingTile key={p.id} pairing={p} card={cardByName.get(p.coin_name.toLowerCase())} />
          ))}
        </div>
      )}
    </main>
  );
}

function PairingTile({
  pairing,
  card,
}: {
  pairing: PairingRow;
  card?: {
    id: string;
    ticker: string;
    list_price: number | null;
    last_price: number | null;
    owner?: { username: string } | null;
  };
}) {
  const art = pokemonArtwork(pairing.pokedex_id);
  const type = typeStyle(pairing.card_type ?? "Normal");

  return (
    <article className="dex-card dex-card-interactive holo-sheen flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold leading-tight text-poke-navy">
            {pairing.coin_name}
          </h2>
          <p className="mono-num text-xs uppercase text-muted-foreground">${pairing.coin_symbol}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${rarityStyle(pairing.rarity)}`}
        >
          {pairing.rarity}
        </span>
      </div>

      <div
        className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br p-3 ${type.art}`}
      >
        {art ? (
          <img src={art} alt={pairing.pokemon_name} className="h-20 w-20 object-contain" />
        ) : null}
        <div>
          <p className="font-display text-lg font-bold text-poke-navy">{pairing.pokemon_name}</p>
          {pairing.pokedex_id ? (
            <p className="mono-num text-xs text-muted-foreground">
              #{String(pairing.pokedex_id).padStart(3, "0")}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-1">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${type.chip}`}>
              {pairing.card_type ?? "Normal"}
            </span>
            {pairing.pokemon_types.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-poke-navy"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="line-clamp-4 text-sm text-muted-foreground">{pairing.explanation}</p>

      <div className="mt-auto border-t border-border pt-3 text-xs">
        {card ? (
          <div className="flex items-center justify-between gap-2">
            <div className="mono-num text-muted-foreground">
              <span className="mr-2">Price {formatPokeCoin(card.list_price)}</span>
              <span>Last {formatPokeCoin(card.last_price)}</span>
            </div>
            <Link
              to="/card/$cardId"
              params={{ cardId: card.id }}
              className="font-semibold text-poke-blue hover:underline"
            >
              Token page →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <span>Not minted yet</span>
            <Link to="/mint" className="font-semibold text-poke-blue hover:underline">
              Mint it →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
