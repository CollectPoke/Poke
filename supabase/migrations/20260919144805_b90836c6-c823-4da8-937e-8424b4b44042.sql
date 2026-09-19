
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 0;
BEGIN
  base := lower(regexp_replace(coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'trainer'), '[^a-zA-Z0-9_]', '', 'g'));
  IF base = '' THEN base := 'trainer'; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    n := n + 1;
    candidate := base || n::text;
  END LOOP;
  INSERT INTO public.profiles (id, username) VALUES (NEW.id, candidate);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_key text NOT NULL,
  ticker text NOT NULL,
  description text,
  card_type text NOT NULL DEFAULT 'Normal',
  rarity text NOT NULL DEFAULT 'Common',
  hp int NOT NULL DEFAULT 60,
  image_url text,
  contract_address text NOT NULL,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'minted',
  list_price numeric(18,4),
  last_price numeric(18,4),
  mint_price numeric(18,4) NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cards_status_check CHECK (status IN ('minted', 'burned')),
  CONSTRAINT cards_rarity_check CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Holo Rare', 'Legendary'))
);
CREATE UNIQUE INDEX cards_unique_active_name ON public.cards (name_key) WHERE status = 'minted';
CREATE INDEX cards_owner_idx ON public.cards (owner_id);

GRANT SELECT ON public.cards TO anon;
GRANT SELECT, INSERT, UPDATE ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards_public_read" ON public.cards FOR SELECT USING (true);
CREATE POLICY "cards_insert_own" ON public.cards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id AND auth.uid() = owner_id);
CREATE POLICY "cards_update_own" ON public.cards FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.cards_set_name_key()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.name_key := lower(btrim(NEW.name));
  RETURN NEW;
END;
$$;
CREATE TRIGGER cards_name_key_trg BEFORE INSERT OR UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.cards_set_name_key();

CREATE TABLE public.card_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  kind text NOT NULL,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  counterparty_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  price numeric(18,4),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT card_events_kind_check CHECK (kind IN ('mint', 'list', 'unlist', 'sale', 'burn'))
);
CREATE INDEX card_events_card_idx ON public.card_events (card_id, created_at DESC);
GRANT SELECT ON public.card_events TO anon;
GRANT SELECT, INSERT ON public.card_events TO authenticated;
GRANT ALL ON public.card_events TO service_role;
ALTER TABLE public.card_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "card_events_public_read" ON public.card_events FOR SELECT USING (true);
CREATE POLICY "card_events_insert_own" ON public.card_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

CREATE OR REPLACE FUNCTION public.buy_card(_card_id uuid)
RETURNS public.cards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.cards;
  buyer uuid := auth.uid();
  seller uuid;
  paid numeric(18,4);
BEGIN
  IF buyer IS NULL THEN RAISE EXCEPTION 'You must be signed in to buy a card'; END IF;
  SELECT * INTO c FROM public.cards WHERE id = _card_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Card not found'; END IF;
  IF c.status <> 'minted' THEN RAISE EXCEPTION 'This card has been burned'; END IF;
  IF c.list_price IS NULL THEN RAISE EXCEPTION 'This card is not for sale'; END IF;
  IF c.owner_id = buyer THEN RAISE EXCEPTION 'You already own this card'; END IF;
  seller := c.owner_id;
  paid := c.list_price;
  UPDATE public.cards
    SET owner_id = buyer, list_price = NULL, last_price = paid
    WHERE id = _card_id
    RETURNING * INTO c;
  INSERT INTO public.card_events (card_id, kind, actor_id, counterparty_id, price)
    VALUES (_card_id, 'sale', buyer, seller, paid);
  RETURN c;
END;
$$;
REVOKE ALL ON FUNCTION public.buy_card(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.buy_card(uuid) TO authenticated;
