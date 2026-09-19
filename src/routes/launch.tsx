import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FEE_SPLIT, GRADE_FLOORS, POKEMON_PICKS, estimatePick } from "@/lib/pokepad";
import { spriteUrl } from "@/lib/catalog";

export const Route = createFileRoute("/launch")({
  component: LaunchPage,
  head: () => ({
    meta: [
      { title: "Launch a coin · PokéPad" },
      {
        name: "description",
        content:
          "Launch a pump.fun coin paired with CARDS, pick the Pokémon and grade floor it collects, and lock the fee so every trade buys real graded cards for holders.",
      },
      { property: "og:title", content: "Launch a coin · PokéPad" },
      {
        property: "og:description",
        content: "Pick your Pokémon, set a grade floor, lock the fee. The creator takes none of it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

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
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="ml-2 text-xs text-muted-foreground">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30";

function LaunchPage() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [pokemon, setPokemon] = useState("Pikachu");
  const [customPokemon, setCustomPokemon] = useState("");
  const [floor, setFloor] = useState("9+");
  const [firstBuy, setFirstBuy] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const pick = customPokemon.trim() || pokemon;
  const estimate = useMemo(() => estimatePick(pick, floor), [pick, floor]);
  const spriteId = POKEMON_PICKS.find((p) => p.name === pick)?.pokemonId ?? 25;

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20 text-center">
        <img src={spriteUrl(spriteId || 25)} alt="" className="mx-auto h-28 w-28 object-contain" />
        <h1 className="mt-4 font-display text-4xl">Ready to sign</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {name || "Your coin"} (${ticker || "TICKER"}) would be created on pump.fun against CARDS,
          collecting <strong>{pick}</strong> at <strong>{floor}</strong>, with the 1% fee locked and
          the admin key thrown away in the same transaction.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Wallet signing isn't connected yet, so nothing was created. Say the word and I'll wire it
          to Phantom and Solflare.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary"
        >
          Back to the form
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16">
      <div className="pt-10 pb-6">
        <h1 className="font-display text-4xl">Launch a coin</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          A real pump.fun coin, paired with CARDS instead of SOL. Your pick is permanent: it is fixed
          by the launch itself.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form
          className="dex-card space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name">
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pika Only"
              />
            </Field>
            <Field label="Ticker">
              <input
                className={inputCls}
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 10))}
                placeholder="PIKAONLY"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              className={`${inputCls} min-h-24 resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What the coin is about."
            />
          </Field>

          <Field label="What it collects" hint="permanent">
            <div className="flex flex-wrap gap-2">
              {POKEMON_PICKS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setPokemon(p.name);
                    setCustomPokemon("");
                  }}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    pick === p.name
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <input
              className={`${inputCls} mt-2`}
              value={customPokemon}
              onChange={(e) => setCustomPokemon(e.target.value)}
              placeholder="…or type any other Pokémon's name"
            />
          </Field>

          <Field label="Grade floor" hint="any grader counts">
            <div className="flex flex-wrap gap-2">
              {GRADE_FLOORS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFloor(g)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    floor === g
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>

          <Field label="First buy" hint="optional, paid in CARDS on the same curve">
            <input
              className={inputCls}
              value={firstBuy}
              onChange={(e) => setFirstBuy(e.target.value)}
              placeholder="0"
              inputMode="decimal"
            />
          </Field>

          <button
            type="submit"
            className="w-full rounded-full bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Approve and launch
          </button>
          <p className="text-xs text-muted-foreground">
            Costs: pump.fun's normal creation cost and network rent, plus 0.02 SOL that goes into
            your coin's own wallet so it can pay its network fees. With a first buy it is two
            approvals.
          </p>
        </form>

        <aside className="space-y-4">
          <div className="dex-card p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              What your pick buys today
            </p>
            <div className="mt-3 flex items-center gap-4">
              <img src={spriteUrl(spriteId || 25)} alt="" className="h-16 w-16 object-contain" />
              <div>
                <p className="font-display text-2xl">{pick}</p>
                <p className="text-sm text-muted-foreground">grade floor {floor}</p>
              </div>
            </div>
            <div className="mono-num mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">listed right now</span>
                <span>{estimate.listings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">cheapest match</span>
                <span>${estimate.cheapest.toFixed(2)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Narrow picks hit a thin slice of the market harder. Wide picks get their first card
              sooner.
            </p>
          </div>

          <div className="dex-card p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              The 1% fee, locked
            </p>
            <div className="mt-3 space-y-2">
              {FEE_SPLIT.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={s.pct === 0 ? "text-muted-foreground" : ""}>{s.label}</span>
                  <span className="mono-num">{s.pct}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              You get nothing from the fee. Your only position is the coins you buy, like everyone
              else.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
