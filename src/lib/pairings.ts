import { supabase } from "@/integrations/supabase/client";

export type PairingRow = {
  id: string;
  coin_name: string;
  coin_symbol: string;
  coin_description: string | null;
  pokemon_name: string;
  pokedex_id: number | null;
  pokemon_types: string[];
  rarity: string;
  card_type: string | null;
  explanation: string;
  created_by: string | null;
  created_at: string;
};

export function pokemonArtwork(pokedexId: number | null | undefined): string | null {
  if (!pokedexId || pokedexId < 1) return null;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexId}.png`;
}

export async function listPairings(limit = 100) {
  const { data, error } = await supabase
    .from("pairings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as PairingRow[];
}

export async function savePairing(input: {
  coin_name: string;
  coin_symbol: string;
  coin_description: string;
  pokemon_name: string;
  pokedex_id: number;
  pokemon_types: string[];
  card_type: string;
  rarity: string;
  explanation: string;
  created_by: string;
}) {
  const { data, error } = await supabase.from("pairings").insert(input).select("*").single();
  if (error) throw error;
  return data as unknown as PairingRow;
}
