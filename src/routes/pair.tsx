import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { rarityStyle, typeStyle } from "@/lib/cards";
import { useAuth } from "@/lib/auth";
import { pokemonArtwork, savePairing } from "@/lib/pairings";
import { suggestPairing, type PairingSuggestion } from "@/lib/pairing.functions";

export const Route = createFileRoute("/pair")({
  head: () => ({
    meta: [
      { title: "Pair your coin with a Pokémon · Poke" },
      {
        name: "description",
        content:
          "Describe your memecoin and get an instant Pokémon pairing, with typing, rarity and the reasoning behind the match.",
      },
      { property: "og:title", content: "Pair your coin with a Pokémon · Poke" },
      {
        property: "og:description",
        content:
          "Describe your memecoin and get an instant Pokémon pairing, with typing, rarity and the reasoning behind the match.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PairPage,
});

function PairPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const suggest = useServerFn(suggestPairing);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<PairingSuggestion | null>(null);

  const pairing = useMutation({
    mutationFn: () =>
      suggest({ data: { name: name.trim(), symbol: symbol.trim(), description: description.trim() } }),
    onSuccess: (data) => setResult(data),
    onError: (e: Error) => toast.error(e.message || "Could not find a pairing."),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!user || !result) throw new Error("Sign in first.");
      return savePairing({
        coin_name: name.trim(),
        coin_symbol: symbol.trim().toUpperCase(),
        coin_description: description.trim(),
        pokemon_name: result.pokemon_name,
        pokedex_id: result.pokedex_id,
        pokemon_types: result.pokemon_types,
        card_type: result.card_type,
        rarity: result.rarity,
        explanation: result.explanation,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pairings"] });
      toast.success("Pairing saved.");
      navigate({ to: "/cards" });
    },
    onError: (e: Error) => toast.error(e.message || "Could not save the pairing."),
  });

  const canSubmit = name.trim().length > 0 && symbol.trim().length > 0 && !pairing.isPending;
  const art = result ? pokemonArtwork(result.pokedex_id) : null;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-poke-navy">Pokémon pairing engine</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Tell us about your memecoin and we&apos;ll match it to the Pokémon that fits its vibe,
          with a typing, a rarity and the reasoning behind the call. Save it, then mint it into
          a one-of-one card.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <form
          className="dex-card space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) pairing.mutate();
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="coin-name">
              Coin name
            </label>
            <input
              id="coin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dog"
              maxLength={60}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-poke-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="coin-symbol">
              Symbol
            </label>
            <input
              id="coin-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="DOG"
              maxLength={15}
              className="mono-num w-full rounded-xl border border-border bg-background px-3 py-2 uppercase outline-none focus:border-poke-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="coin-desc">
              Description
            </label>
            <textarea
              id="coin-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={600}
              placeholder="What's the story, the meme, the community?"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-poke-blue"
            />
          </div>
          <button type="submit" disabled={!canSubmit} className="poke-btn w-full disabled:opacity-50">
            {pairing.isPending ? "Consulting the Pokédex…" : "Find my Pokémon"}
          </button>
          <p className="text-xs text-muted-foreground">
            Pairings take a few seconds — the model reads your description before it answers.
          </p>
        </form>

        <div>
          {pairing.isPending ? (
            <div className="dex-card flex h-full min-h-[320px] flex-col items-center justify-center gap-4 p-6 text-center">
              <img src="/favicon.png" alt="" className="h-14 w-14 animate-bounce" />
              <p className="text-muted-foreground">Matching your coin to a Pokémon…</p>
            </div>
          ) : result ? (
            <div className="dex-card holo-sheen space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {name} · {symbol.toUpperCase()}
                  </p>
                  <h2 className="font-display text-3xl font-bold text-poke-navy">
                    {result.pokemon_name}
                  </h2>
                  {result.pokedex_id ? (
                    <p className="mono-num text-sm text-muted-foreground">
                      #{String(result.pokedex_id).padStart(3, "0")}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${rarityStyle(result.rarity)}`}
                >
                  {result.rarity}
                </span>
              </div>

              {art ? (
                <div
                  className={`flex items-center justify-center rounded-2xl bg-gradient-to-br p-4 ${typeStyle(result.card_type).art}`}
                >
                  <img src={art} alt={result.pokemon_name} className="h-44 w-44 object-contain" />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyle(result.card_type).chip}`}
                >
                  {result.card_type}
                </span>
                {result.pokemon_types.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p className="text-sm leading-relaxed">{result.explanation}</p>

              <div className="flex flex-wrap gap-2 pt-2">
                {user ? (
                  <button
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                    className="poke-btn disabled:opacity-50"
                  >
                    {save.isPending ? "Saving…" : "Save pairing"}
                  </button>
                ) : (
                  <Link to="/auth" className="poke-btn">
                    Sign in to save it
                  </Link>
                )}
                <Link to="/mint" className="poke-btn-navy">
                  Mint this card
                </Link>
              </div>
            </div>
          ) : (
            <div className="dex-card flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
              <img src="/favicon.png" alt="" className="h-12 w-12 opacity-60" />
              <p>Your pairing will appear here.</p>
              <Link to="/cards" className="text-poke-blue underline">
                Browse all cards
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
