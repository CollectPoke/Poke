CREATE TABLE public.card_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  price numeric(18,4) NOT NULL CHECK (price > 0),
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX card_offers_card_idx ON public.card_offers (card_id, status);
CREATE INDEX card_offers_buyer_idx ON public.card_offers (buyer_id);
CREATE UNIQUE INDEX card_offers_one_pending ON public.card_offers (card_id, buyer_id) WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE ON public.card_offers TO authenticated;
GRANT ALL ON public.card_offers TO service_role;

ALTER TABLE public.card_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers see their own offers"
  ON public.card_offers FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Owners see offers on their cards"
  ON public.card_offers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cards c WHERE c.id = card_id AND c.owner_id = auth.uid()));

CREATE POLICY "Buyers make their own offers"
  ON public.card_offers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id AND status = 'pending');

CREATE POLICY "Buyers withdraw their own offers"
  ON public.card_offers FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id AND status = 'pending')
  WITH CHECK (auth.uid() = buyer_id AND status = 'withdrawn');

CREATE OR REPLACE FUNCTION public.card_offers_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER card_offers_updated_at_trg
  BEFORE UPDATE ON public.card_offers
  FOR EACH ROW EXECUTE FUNCTION public.card_offers_set_updated_at();