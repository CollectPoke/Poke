ALTER TABLE public.coin_launches DROP CONSTRAINT coin_launches_status_check;
ALTER TABLE public.coin_launches ADD CONSTRAINT coin_launches_status_check CHECK (status IN ('pending', 'launched', 'retired', 'failed'));
DROP POLICY IF EXISTS "Confirmed launches are public" ON public.coin_launches;
CREATE POLICY "Confirmed launches are public"
  ON public.coin_launches FOR SELECT TO anon, authenticated
  USING (status IN ('launched', 'retired'));

CREATE OR REPLACE FUNCTION public.retire_coin_launch_on_card_burn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status = 'minted' AND NEW.status = 'burned' AND NEW.launch_id IS NOT NULL THEN
    UPDATE public.coin_launches SET status = 'retired' WHERE id = NEW.launch_id AND status = 'launched';
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.retire_coin_launch_on_card_burn() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER cards_retire_launch_on_burn
  AFTER UPDATE OF status ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.retire_coin_launch_on_card_burn();