CREATE POLICY "Buyers delete their own offers"
  ON public.card_offers FOR DELETE TO authenticated
  USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Confirmed launches are public" ON public.coin_launches;
REVOKE SELECT ON public.coin_launches FROM anon;