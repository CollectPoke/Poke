CREATE TABLE public.card_sale_reservations (
  card_id uuid PRIMARY KEY REFERENCES public.cards(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price numeric(18,4) NOT NULL CHECK (price > 0),
  offer_id uuid REFERENCES public.card_offers(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.card_sale_reservations TO service_role;
ALTER TABLE public.card_sale_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "card_sale_reservations_no_client_access"
  ON public.card_sale_reservations AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.reserve_card_sale(
  _card_id uuid,
  _buyer_id uuid,
  _offer_id uuid DEFAULT NULL
)
RETURNS TABLE (seller_id uuid, price numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.cards;
  o public.card_offers;
BEGIN
  IF _buyer_id IS NULL THEN RAISE EXCEPTION 'A buyer is required'; END IF;
  DELETE FROM public.card_sale_reservations WHERE expires_at <= now();
  SELECT * INTO c FROM public.cards WHERE id = _card_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFT not found'; END IF;
  IF c.status <> 'minted' THEN RAISE EXCEPTION 'This NFT has been burned'; END IF;
  IF c.owner_id = _buyer_id THEN RAISE EXCEPTION 'You already own this NFT'; END IF;
  IF EXISTS (SELECT 1 FROM public.card_sale_reservations WHERE card_id = _card_id) THEN
    RAISE EXCEPTION 'Another purchase is already in progress';
  END IF;

  IF _offer_id IS NULL THEN
    IF c.list_price IS NULL THEN RAISE EXCEPTION 'This NFT is not for sale'; END IF;
    INSERT INTO public.card_sale_reservations(card_id, buyer_id, seller_id, price)
      VALUES (_card_id, _buyer_id, c.owner_id, c.list_price);
    RETURN QUERY SELECT c.owner_id, c.list_price;
  ELSE
    SELECT * INTO o FROM public.card_offers WHERE id = _offer_id FOR UPDATE;
    IF NOT FOUND OR o.card_id <> _card_id THEN RAISE EXCEPTION 'Offer not found'; END IF;
    IF o.status <> 'pending' THEN RAISE EXCEPTION 'This offer is no longer open'; END IF;
    IF o.buyer_id <> _buyer_id THEN RAISE EXCEPTION 'Offer buyer does not match'; END IF;
    INSERT INTO public.card_sale_reservations(card_id, buyer_id, seller_id, price, offer_id)
      VALUES (_card_id, _buyer_id, c.owner_id, o.price, _offer_id);
    RETURN QUERY SELECT c.owner_id, o.price;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_card_sale(
  _card_id uuid,
  _buyer_id uuid,
  _tx_signature text
)
RETURNS public.cards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.cards;
  r public.card_sale_reservations;
BEGIN
  SELECT * INTO r FROM public.card_sale_reservations WHERE card_id = _card_id FOR UPDATE;
  IF NOT FOUND OR r.expires_at <= now() THEN RAISE EXCEPTION 'The purchase reservation expired'; END IF;
  IF r.buyer_id <> _buyer_id THEN RAISE EXCEPTION 'This purchase belongs to another buyer'; END IF;
  SELECT * INTO c FROM public.cards WHERE id = _card_id FOR UPDATE;
  IF NOT FOUND OR c.status <> 'minted' OR c.owner_id <> r.seller_id THEN
    RAISE EXCEPTION 'NFT ownership changed before payment completed';
  END IF;
  UPDATE public.cards
    SET owner_id = r.buyer_id, list_price = NULL, last_price = r.price
    WHERE id = _card_id
    RETURNING * INTO c;
  INSERT INTO public.card_events(card_id, kind, actor_id, counterparty_id, price, tx_signature)
    VALUES (_card_id, 'sale', r.buyer_id, r.seller_id, r.price, _tx_signature);
  IF r.offer_id IS NOT NULL THEN
    UPDATE public.card_offers SET status = 'accepted' WHERE id = r.offer_id AND status = 'pending';
  END IF;
  UPDATE public.card_offers SET status = 'declined'
    WHERE card_id = _card_id AND status = 'pending';
  DELETE FROM public.card_sale_reservations WHERE card_id = _card_id;
  RETURN c;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_card_sale(_card_id uuid, _buyer_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.card_sale_reservations
  WHERE card_id = _card_id AND buyer_id = _buyer_id;
$$;

REVOKE EXECUTE ON FUNCTION public.reserve_card_sale(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_card_sale(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_card_sale(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_card_sale(uuid, uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_card_sale(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_card_sale(uuid, uuid) TO service_role;