export type DexEntry = {
  /** CoinGecko id */
  id: string;
  ticker: string;
  coinName: string;
  pokemonId: number;
  pokemonName: string;
  type: string;
  flavor: string;
};

export const CATALOG: DexEntry[] = [
  {
    id: "dogecoin",
    ticker: "DOGE",
    coinName: "Dogecoin",
    pokemonId: 59,
    pokemonName: "Arcanine",
    type: "Fire",
    flavor: "The original good boy. Loyal, loud, and impossible to ignore.",
  },
  {
    id: "shiba-inu",
    ticker: "SHIB",
    coinName: "Shiba Inu",
    pokemonId: 58,
    pokemonName: "Growlithe",
    type: "Fire",
    flavor: "Smaller sibling energy with a very large supply of enthusiasm.",
  },
  {
    id: "pepe",
    ticker: "PEPE",
    coinName: "Pepe",
    pokemonId: 658,
    pokemonName: "Greninja",
    type: "Water",
    flavor: "Amphibious, meme-native, disappears the moment you look away.",
  },
  {
    id: "bonk",
    ticker: "BONK",
    coinName: "Bonk",
    pokemonId: 506,
    pokemonName: "Lillipup",
    type: "Normal",
    flavor: "Small dog, big bonk. Chews through resistance levels.",
  },
  {
    id: "dogwifcoin",
    ticker: "WIF",
    coinName: "dogwifhat",
    pokemonId: 676,
    pokemonName: "Furfrou",
    type: "Normal",
    flavor: "It is, unmistakably, a dog with a hat.",
  },
  {
    id: "floki",
    ticker: "FLOKI",
    coinName: "Floki",
    pokemonId: 38,
    pokemonName: "Ninetales",
    type: "Fire",
    flavor: "Nine tails, nine roadmaps, one very persistent marketing budget.",
  },
  {
    id: "popcat",
    ticker: "POPCAT",
    coinName: "Popcat",
    pokemonId: 52,
    pokemonName: "Meowth",
    type: "Normal",
    flavor: "Opens mouth. Closes mouth. Repeat until liquidity arrives.",
  },
  {
    id: "mog-coin",
    ticker: "MOG",
    coinName: "Mog Coin",
    pokemonId: 677,
    pokemonName: "Espurr",
    type: "Psychic",
    flavor: "Blank stare hiding an alarming amount of conviction.",
  },
  {
    id: "based-brett",
    ticker: "BRETT",
    coinName: "Brett",
    pokemonId: 194,
    pokemonName: "Wooper",
    type: "Water",
    flavor: "Blue, cheerful, refuses to overthink anything.",
  },
  {
    id: "book-of-meme",
    ticker: "BOME",
    coinName: "Book of Meme",
    pokemonId: 201,
    pokemonName: "Unown",
    type: "Psychic",
    flavor: "An archive of symbols nobody has fully decoded.",
  },
  {
    id: "pudgy-penguins",
    ticker: "PENGU",
    coinName: "Pudgy Penguins",
    pokemonId: 393,
    pokemonName: "Piplup",
    type: "Water",
    flavor: "Waddles with dignity. Slips with style.",
  },
  {
    id: "turbo",
    ticker: "TURBO",
    coinName: "Turbo",
    pokemonId: 78,
    pokemonName: "Rapidash",
    type: "Fire",
    flavor: "Built for speed, allergic to consolidation.",
  },
  {
    id: "goatseus-maximus",
    ticker: "GOAT",
    coinName: "Goatseus Maximus",
    pokemonId: 673,
    pokemonName: "Gogoat",
    type: "Grass",
    flavor: "Climbs things it has no business climbing.",
  },
  {
    id: "fartcoin",
    ticker: "FARTCOIN",
    coinName: "Fartcoin",
    pokemonId: 110,
    pokemonName: "Weezing",
    type: "Poison",
    flavor: "Emits a gas that somehow attracts volume.",
  },
  {
    id: "spx6900",
    ticker: "SPX",
    coinName: "SPX6900",
    pokemonId: 137,
    pokemonName: "Porygon",
    type: "Normal",
    flavor: "A synthetic index of pure belief.",
  },
  {
    id: "peanut-the-squirrel",
    ticker: "PNUT",
    coinName: "Peanut the Squirrel",
    pokemonId: 417,
    pokemonName: "Pachirisu",
    type: "Electric",
    flavor: "Hoards nuts. Occasionally shocks the whole market.",
  },
];

export const CATALOG_BY_ID = Object.fromEntries(
  CATALOG.map((e) => [e.id, e]),
) as Record<string, DexEntry>;

export const spriteUrl = (pokemonId: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

export const TYPE_CLASS: Record<string, string> = {
  Fire: "bg-type-fire/12 text-type-fire",
  Water: "bg-type-water/12 text-type-water",
  Grass: "bg-type-grass/12 text-type-grass",
  Electric: "bg-type-electric/15 text-type-electric",
  Psychic: "bg-type-psychic/12 text-type-psychic",
  Poison: "bg-type-poison/12 text-type-poison",
  Normal: "bg-type-normal/12 text-type-normal",
};
