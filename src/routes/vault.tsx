import { createFileRoute } from "@tanstack/react-router";
import { VAULT, vaultTotals } from "@/lib/vault";
import { spriteUrl } from "@/lib/catalog";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "The Vault — PokéPad" },
      {
        name: "description",
        content:
          "Every graded Pokémon card bought with PokéPad trading fees, with grade, cert number and what it cost.",
      },
      { property: "og:title", content: "The Vault — PokéPad" },
      {
        property: "og:description",
        content: "Real graded slabs, bought with trading fees. Grade, cert and cost for each one.",
      },
    ],
  }),
  component: VaultPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Nothing here.</div>,
});

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function VaultPage() {
  const totals = vaultTotals();

  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
      <span className="mono-num text-xs uppercase tracking-[0.2em] text-muted-foreground">
        The Vault
      </span>
      <h1 className="mt-4 max-w-2xl text-4xl leading-[1.08] sm:text-5xl">
        Receipts, not roadmaps.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Every card below was bought with trading fees and sent straight to grading. Grade, cert
        number and price paid are all listed.
      </p>

      <div className="dex-card mt-8 grid grid-cols-2 sm:grid-cols-3">
        {[
          ["Spent on cards", usd(totals.spent)],
          ["Slabs secured", String(totals.count)],
          ["In the vault", String(totals.vaulted)],
        ].map(([label, value]) => (
          <div key={label} className="border-l border-border p-5 first:border-l-0">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {label}
            </div>
            <div className="mono-num mt-1 text-xl">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VAULT.map((c) => (
          <article key={c.id} className="dex-card overflow-hidden">
            <div className="relative bg-surface p-6">
              <div className="absolute left-4 top-4 rounded-md bg-primary px-2 py-1">
                <span className="mono-num text-[10px] tracking-widest text-primary-foreground">
                  {c.grader} {c.grade} {c.label}
                </span>
              </div>
              <img
                src={spriteUrl(c.pokemonId)}
                alt={c.cardName}
                loading="lazy"
                className="mx-auto h-36 w-36 object-contain"
              />
            </div>
            <div className="p-5">
              <h2 className="text-xl leading-tight">{c.cardName}</h2>
              <p className="text-sm text-muted-foreground">
                {c.set} · {c.year}
              </p>
              <dl className="mono-num mt-4 space-y-1.5 border-t border-border pt-4 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Paid</dt>
                  <dd>{usd(c.paid)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Funded by</dt>
                  <dd>{c.fundedBy}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cert</dt>
                  <dd>{c.cert}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>{c.status}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
