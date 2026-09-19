import { createFileRoute, Link } from "@tanstack/react-router";
import { CARDS_SENT, SITE_STATS } from "@/lib/pokepad";
import { spriteUrl } from "@/lib/catalog";

export const Route = createFileRoute("/cards-sent")({
  component: CardsSentPage,
  head: () => ({
    meta: [
      { title: "Cards sent · PokéPad" },
      {
        name: "description",
        content:
          "The live feed of every real graded Pokémon card bought by PokéPad coins and sent to their holders.",
      },
      { property: "og:title", content: "Cards sent · PokéPad" },
      {
        property: "og:description",
        content: "Which card, which cert, what was paid, who received it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CardsSentPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-16">
      <div className="pt-10 pb-6">
        <h1 className="font-display text-4xl">Cards sent</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every card every coin has bought. {SITE_STATS.cardsSent.toLocaleString()} slabs, $
          {SITE_STATS.cardsValue.toLocaleString()} paid, all of it on chain.
        </p>
      </div>

      <div className="grid gap-3">
        {CARDS_SENT.map((p) => (
          <div key={p.sig} className="dex-card flex flex-wrap items-center gap-4 p-4">
            <img src={spriteUrl(p.pokemonId || 25)} alt="" className="h-12 w-12 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <strong>{p.card}</strong> <span className="text-muted-foreground">· {p.set}</span>
              </p>
              <p className="mono-num mt-0.5 text-xs text-muted-foreground">
                {p.grader} {p.grade} · {p.cert} · {p.ago}
              </p>
            </div>
            <Link
              to="/coin/$coinId"
              params={{ coinId: p.coinId }}
              className="mono-num rounded-full bg-secondary px-3 py-1 text-xs hover:bg-secondary/70"
            >
              ${p.coinTicker}
            </Link>
            <div className="mono-num w-44 text-right text-xs">
              <p>${p.price}</p>
              <p className="text-muted-foreground">
                → {p.destination === "vault" ? "vault" : p.to}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
