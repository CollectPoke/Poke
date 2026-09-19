
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.cards_set_name_key() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.buy_card(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.buy_card(uuid) TO authenticated;
