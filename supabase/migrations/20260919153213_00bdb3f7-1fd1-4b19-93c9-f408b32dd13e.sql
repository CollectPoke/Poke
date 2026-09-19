CREATE TABLE public.artwork (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mime TEXT NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.artwork TO anon, authenticated;
GRANT INSERT, DELETE ON public.artwork TO authenticated;
GRANT ALL ON public.artwork TO service_role;

ALTER TABLE public.artwork ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artwork"
  ON public.artwork FOR SELECT
  USING (true);

CREATE POLICY "Users can upload their own artwork"
  ON public.artwork FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own artwork"
  ON public.artwork FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);