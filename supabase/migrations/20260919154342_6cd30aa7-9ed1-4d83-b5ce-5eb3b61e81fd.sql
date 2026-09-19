CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  public_key text NOT NULL UNIQUE,
  secret_ciphertext text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_address text;
ALTER TABLE public.card_events ADD COLUMN IF NOT EXISTS tx_signature text;