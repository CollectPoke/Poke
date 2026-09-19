CREATE TABLE public.buybacks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_signature text NOT NULL UNIQUE,
  sol_spent numeric(18,6) NOT NULL DEFAULT 0,
  poke_bought numeric(24,4) NOT NULL DEFAULT 0,
  executed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.buybacks TO anon;
GRANT SELECT ON public.buybacks TO authenticated;
GRANT ALL ON public.buybacks TO service_role;

ALTER TABLE public.buybacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buybacks_public_read" ON public.buybacks FOR SELECT USING (true);

CREATE INDEX buybacks_executed_at_idx ON public.buybacks (executed_at DESC);