import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { acceptOffer, declineOffer, makeOffer, withdrawOffer } from "@/lib/offers.functions";
import { offersForCard } from "@/lib/queries";

/**
 * Offers on a card: owners see incoming requests and accept or decline them,
 * everyone else can ask the owner to sell at their own price.
 */
export function OfferPanel({
  cardId,
  userId,
  isOwner,
}: {
  cardId: string;
  userId: string;
  isOwner: boolean;
}) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState<{ text: string; bad?: boolean } | null>(null);

  const send = useServerFn(makeOffer);
  const pull = useServerFn(withdrawOffer);
  const yes = useServerFn(acceptOffer);
  const no = useServerFn(declineOffer);

  const { data: offers } = useQuery({
    queryKey: ["card-offers", cardId],
    queryFn: () => offersForCard(cardId),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["card-offers", cardId] });
    queryClient.invalidateQueries({ queryKey: ["offers"] });
    queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    queryClient.invalidateQueries({ queryKey: ["card-events", cardId] });
    queryClient.invalidateQueries({ queryKey: ["cards"] });
    queryClient.invalidateQueries({ queryKey: ["my-cards"] });
  };

  const act = useMutation({
    mutationFn: async (
      input:
        | { kind: "make" }
        | { kind: "withdraw" | "accept" | "decline"; offerId: string },
    ) => {
      if (input.kind === "make") {
        const value = Number(price);
        if (!value || value <= 0) throw new Error("Enter an offer above zero.");
        await send({ data: { cardId, price: value, message: message.trim() || undefined } });
        return "Offer sent — the owner decides.";
      }
      if (input.kind === "withdraw") {
        await pull({ data: { offerId: input.offerId } });
        return "Offer taken back.";
      }
      if (input.kind === "decline") {
        await no({ data: { offerId: input.offerId } });
        return "Offer declined.";
      }
      const res = await yes({ data: { offerId: input.offerId } });
      return `Sold for ${res.price} SOL — the SOL is in your wallet.`;
    },
    onSuccess: (text) => {
      setNote({ text });
      setPrice("");
      setMessage("");
      refresh();
    },
    onError: (err) =>
      setNote({ text: err instanceof Error ? err.message : "Something went wrong.", bad: true }),
  });

  const list = offers ?? [];
  const mine = list.find((o) => o.buyer_id === userId) ?? null;
  const incoming = isOwner ? list : [];

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display text-lg font-bold">
        {isOwner ? "Offers on your card" : "Make an offer"}
      </h3>

      {isOwner ? (
        incoming.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No offers yet. Trainers can ask to buy this card at their own price.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {incoming.map((o) => (
              <li
                key={o.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    <span className="mono-num text-poke-blue">{o.price} SOL</span> from{" "}
                    {o.buyer?.username ?? "a trainer"}
                  </p>
                  {o.message ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">"{o.message}"</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => act.mutate({ kind: "accept", offerId: o.id })}
                    disabled={act.isPending}
                    className="poke-btn !py-2 disabled:opacity-50"
                  >
                    {act.isPending ? "…" : "Accept"}
                  </button>
                  <button
                    onClick={() => act.mutate({ kind: "decline", offerId: o.id })}
                    disabled={act.isPending}
                    className="rounded-xl border-2 border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : mine ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm">
            Your offer of <span className="mono-num font-bold text-poke-blue">{mine.price} SOL</span>{" "}
            is waiting on the owner.
          </p>
          <button
            onClick={() => act.mutate({ kind: "withdraw", offerId: mine.id })}
            disabled={act.isPending}
            className="rounded-xl border-2 border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            Take it back
          </button>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Name your price. The owner can accept or decline — nothing leaves your wallet until they
            accept.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center rounded-xl border-2 border-border bg-background px-3">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                aria-label="Offer in SOL"
                className="w-20 bg-transparent py-2.5 text-sm font-semibold outline-none"
              />
              <span className="text-sm font-bold text-muted-foreground">SOL</span>
            </div>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message (optional)"
              className="min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-poke-blue"
            />
            <button
              onClick={() => act.mutate({ kind: "make" })}
              disabled={act.isPending}
              className="poke-btn !py-2.5 disabled:opacity-50"
            >
              {act.isPending ? "Sending…" : "Send offer"}
            </button>
          </div>
        </>
      )}

      {note ? (
        <p
          className={`mt-3 text-sm font-semibold ${note.bad ? "text-poke-red" : "text-poke-green"}`}
        >
          {note.text}
        </p>
      ) : null}
    </div>
  );
}
