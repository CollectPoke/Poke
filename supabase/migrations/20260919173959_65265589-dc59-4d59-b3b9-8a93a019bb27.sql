ALTER TABLE public.profiles DROP COLUMN IF EXISTS wallet_address;

DROP POLICY IF EXISTS card_events_authenticated_read ON public.card_events;
CREATE POLICY card_events_participant_read ON public.card_events
  FOR SELECT TO authenticated
  USING (auth.uid() = actor_id OR auth.uid() = counterparty_id);