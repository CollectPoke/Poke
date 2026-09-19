DROP POLICY IF EXISTS "cards_insert_own" ON public.cards;
REVOKE INSERT ON public.cards FROM authenticated;

CREATE OR REPLACE FUNCTION public.cards_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.id <> OLD.id
     OR NEW.name <> OLD.name
     OR NEW.name_key <> OLD.name_key
     OR NEW.ticker <> OLD.ticker
     OR NEW.contract_address <> OLD.contract_address
     OR NEW.creator_id <> OLD.creator_id
     OR NEW.owner_id <> OLD.owner_id
     OR NEW.mint_price <> OLD.mint_price
     OR NEW.created_at <> OLD.created_at
     OR NEW.last_price IS DISTINCT FROM OLD.last_price
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.image_url IS DISTINCT FROM OLD.image_url
     OR NEW.launch_id IS DISTINCT FROM OLD.launch_id
     OR NEW.launch_tx_signature IS DISTINCT FROM OLD.launch_tx_signature
  THEN
    RAISE EXCEPTION 'Only the sale price can change, or the card can be burned';
  END IF;
  IF NEW.status <> OLD.status AND NOT (OLD.status = 'minted' AND NEW.status = 'burned') THEN
    RAISE EXCEPTION 'Invalid card status change';
  END IF;
  IF OLD.status = 'burned' THEN
    RAISE EXCEPTION 'A burned card cannot be changed';
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.cards_guard_update() FROM PUBLIC, anon, authenticated;