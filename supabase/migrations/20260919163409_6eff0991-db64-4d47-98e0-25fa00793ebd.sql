CREATE TABLE public.system_wallets (
  purpose text PRIMARY KEY,
  public_key text NOT NULL UNIQUE,
  secret_ciphertext text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.system_wallets TO service_role;
ALTER TABLE public.system_wallets ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cards ADD COLUMN launch_id uuid UNIQUE REFERENCES public.coin_launches(id);
ALTER TABLE public.cards ADD COLUMN launch_tx_signature text;

CREATE INDEX cards_launch_tx_signature_idx ON public.cards(launch_tx_signature) WHERE launch_tx_signature IS NOT NULL;