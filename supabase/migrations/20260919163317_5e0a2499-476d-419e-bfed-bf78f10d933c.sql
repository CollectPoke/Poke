CREATE TABLE public.coin_launches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_key text NOT NULL,
  ticker text NOT NULL,
  description text,
  image_url text NOT NULL,
  metadata_url text,
  mint_address text UNIQUE,
  tx_signature text UNIQUE,
  launch_budget_sol numeric(18,9) NOT NULL DEFAULT 0.1,
  initial_buy_sol numeric(18,9) NOT NULL DEFAULT 0.09,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'launched', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coin_launches TO anon, authenticated;
GRANT ALL ON public.coin_launches TO service_role;
ALTER TABLE public.coin_launches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Confirmed launches are public"
  ON public.coin_launches FOR SELECT TO anon, authenticated
  USING (status = 'launched');
CREATE POLICY "Creators can view their launch attempts"
  ON public.coin_launches FOR SELECT TO authenticated
  USING (creator_id = auth.uid());
CREATE UNIQUE INDEX coin_launches_active_name_key_idx
  ON public.coin_launches(name_key)
  WHERE status IN ('pending', 'launched');
CREATE INDEX coin_launches_creator_created_idx ON public.coin_launches(creator_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.coin_launches_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.coin_launches_set_updated_at() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER coin_launches_updated_at_trg
  BEFORE UPDATE ON public.coin_launches
  FOR EACH ROW EXECUTE FUNCTION public.coin_launches_set_updated_at();