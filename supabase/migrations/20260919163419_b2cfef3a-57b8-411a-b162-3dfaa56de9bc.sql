CREATE POLICY "system_wallets_no_client_access"
  ON public.system_wallets AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);