-- === cards: immutability guard =========================================
CREATE OR REPLACE FUNCTION public.cards_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.id <> OLD.id
     OR NEW.name <> OLD.name
     OR NEW.name_key <> OLD.name_key
     OR NEW.ticker <> OLD.ticker
     OR NEW.card_type <> OLD.card_type
     OR NEW.rarity <> OLD.rarity
     OR NEW.hp <> OLD.hp
     OR NEW.contract_address <> OLD.contract_address
     OR NEW.creator_id <> OLD.creator_id
     OR NEW.owner_id <> OLD.owner_id
     OR NEW.mint_price <> OLD.mint_price
     OR NEW.created_at <> OLD.created_at
     OR NEW.last_price IS DISTINCT FROM OLD.last_price
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.image_url IS DISTINCT FROM OLD.image_url
  THEN
    RAISE EXCEPTION 'Only the sale price can change, or the card can be burned';
  END IF;
  IF NEW.status <> OLD.status AND NOT (OLD.status = 'minted' AND NEW.status = 'burned') THEN
    RAISE EXCEPTION 'Invalid card status change';
  END IF;
  IF OLD.status = 'burned' THEN
    RAISE EXCEPTION 'A burned card cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cards_guard_update_trg ON public.cards;
CREATE TRIGGER cards_guard_update_trg
BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.cards_guard_update();

REVOKE EXECUTE ON FUNCTION public.cards_guard_update() FROM PUBLIC, anon, authenticated;

-- === card_events: server-written only ==================================
DROP POLICY IF EXISTS "card_events_insert_own" ON public.card_events;
DROP POLICY IF EXISTS "card_events_public_read" ON public.card_events;

CREATE POLICY "card_events_authenticated_read"
  ON public.card_events FOR SELECT TO authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.card_events FROM authenticated, anon;
REVOKE SELECT ON public.card_events FROM anon;
GRANT SELECT ON public.card_events TO authenticated;
GRANT ALL ON public.card_events TO service_role;

CREATE OR REPLACE FUNCTION public.cards_record_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.card_events (card_id, kind, actor_id)
      VALUES (NEW.id, 'mint', NEW.creator_id);
    IF NEW.list_price IS NOT NULL THEN
      INSERT INTO public.card_events (card_id, kind, actor_id, price)
        VALUES (NEW.id, 'list', NEW.creator_id, NEW.list_price);
    END IF;
    RETURN NEW;
  END IF;

  -- ownership change is handled by buy_card itself
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'burned' AND OLD.status <> 'burned' THEN
    INSERT INTO public.card_events (card_id, kind, actor_id)
      VALUES (NEW.id, 'burn', auth.uid());
    RETURN NEW;
  END IF;

  IF NEW.list_price IS DISTINCT FROM OLD.list_price THEN
    IF NEW.list_price IS NULL THEN
      INSERT INTO public.card_events (card_id, kind, actor_id)
        VALUES (NEW.id, 'unlist', auth.uid());
    ELSE
      INSERT INTO public.card_events (card_id, kind, actor_id, price)
        VALUES (NEW.id, 'list', auth.uid(), NEW.list_price);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cards_record_event() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS cards_record_event_ins ON public.cards;
CREATE TRIGGER cards_record_event_ins
AFTER INSERT ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.cards_record_event();

DROP TRIGGER IF EXISTS cards_record_event_upd ON public.cards;
CREATE TRIGGER cards_record_event_upd
AFTER UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.cards_record_event();

-- === buy_card: service-role only ======================================
DROP FUNCTION IF EXISTS public.buy_card(uuid);

CREATE OR REPLACE FUNCTION public.buy_card(_card_id uuid, _buyer_id uuid)
RETURNS public.cards
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  c public.cards;
  seller uuid;
  paid numeric(18,4);
BEGIN
  IF _buyer_id IS NULL THEN RAISE EXCEPTION 'A buyer is required'; END IF;
  SELECT * INTO c FROM public.cards WHERE id = _card_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Card not found'; END IF;
  IF c.status <> 'minted' THEN RAISE EXCEPTION 'This card has been burned'; END IF;
  IF c.list_price IS NULL THEN RAISE EXCEPTION 'This card is not for sale'; END IF;
  IF c.owner_id = _buyer_id THEN RAISE EXCEPTION 'You already own this card'; END IF;
  seller := c.owner_id;
  paid := c.list_price;
  UPDATE public.cards
    SET owner_id = _buyer_id, list_price = NULL, last_price = paid
    WHERE id = _card_id
    RETURNING * INTO c;
  INSERT INTO public.card_events (card_id, kind, actor_id, counterparty_id, price)
    VALUES (_card_id, 'sale', _buyer_id, seller, paid);
  RETURN c;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.buy_card(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.buy_card(uuid, uuid) TO service_role;

-- === wallets: explicit deny for all app roles =========================
REVOKE ALL ON public.wallets FROM anon, authenticated;
GRANT ALL ON public.wallets TO service_role;

DROP POLICY IF EXISTS "wallets_no_client_access" ON public.wallets;
CREATE POLICY "wallets_no_client_access"
  ON public.wallets AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- === buybacks: read-only for clients, writes server-side ==============
REVOKE INSERT, UPDATE, DELETE ON public.buybacks FROM anon, authenticated;
GRANT SELECT ON public.buybacks TO anon, authenticated;
GRANT ALL ON public.buybacks TO service_role;

DROP POLICY IF EXISTS "buybacks_no_client_writes" ON public.buybacks;
CREATE POLICY "buybacks_no_client_writes"
  ON public.buybacks AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (false);