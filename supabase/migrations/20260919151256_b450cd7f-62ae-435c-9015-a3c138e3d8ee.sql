CREATE TABLE public.pairings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coin_name text NOT NULL,
  coin_symbol text NOT NULL,
  coin_description text,
  pokemon_name text NOT NULL,
  pokedex_id integer,
  pokemon_types text[] NOT NULL DEFAULT '{}',
  rarity text NOT NULL DEFAULT 'Common',
  explanation text NOT NULL,
  card_type text,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pairings_created_at_idx ON public.pairings (created_at DESC);

GRANT SELECT ON public.pairings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pairings TO authenticated;
GRANT ALL ON public.pairings TO service_role;

ALTER TABLE public.pairings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pairings are public" ON public.pairings FOR SELECT USING (true);
CREATE POLICY "Signed-in users add pairings" ON public.pairings FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authors edit own pairings" ON public.pairings FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authors delete own pairings" ON public.pairings FOR DELETE TO authenticated USING (auth.uid() = created_by);