export type Purchase = {
  card: string;
  set: string;
  grader: "PSA" | "CGC" | "BGS";
  grade: number;
  cert: string;
  price: number;
  to: string;
  sig: string;
  ago: string;
  destination: "holder" | "vault";
};

export type QueueRow = { wallet: string; balance: number; owed: number };

export type Coin = {
  id: string;
  name: string;
  ticker: string;
  pokemonId: number;
  collects: string;
  gradeFloor: string;
  status: "Bonding" | "Graduated";
  curveProgress: number;
  marketCap: number;
  volume24h: number;
  pot: number;
  cardsSent: number;
  cardsValue: number;
  holders: number;
  createdAgo: string;
  wallet: string;
  vault: string;
  queue: QueueRow[];
  purchases: Purchase[];
};

export const FEE_SPLIT = [
  { label: "Holders, as cards", pct: 70 },
  { label: "The coin's card vault", pct: 10 },
  { label: "Buy & burn $POKEPAD", pct: 20 },
  { label: "The creator", pct: 0 },
];

export const MIN_HOLD = 1_000_000;

/** Snapshot of the card marketplace the engine buys from. */
export const MARKET = {
  listed: 6100,
  under100: 2950,
  cheapest: 13.4,
  asOf: "19 September 2026",
};

export const SITE_STATS = {
  coinsLaunched: 412,
  cardsSent: 1837,
  cardsValue: 71430,
  burned: 4.82, // % of supply
  burns: 906,
  lastBurnSig: "5xQm…9TfB",
};

const q = (wallet: string, balance: number, owed: number): QueueRow => ({ wallet, balance, owed });

export const COINS: Coin[] = [
  {
    id: "pikaonly",
    name: "Pika Only",
    ticker: "PIKAONLY",
    pokemonId: 25,
    collects: "Pikachu",
    gradeFloor: "9+",
    status: "Graduated",
    curveProgress: 100,
    marketCap: 1_840_000,
    volume24h: 612_000,
    pot: 1_284,
    cardsSent: 214,
    cardsValue: 9_640,
    holders: 1_930,
    createdAgo: "23 days ago",
    wallet: "PkPd…a91K",
    vault: "Vau1…7Xn2",
    queue: [
      q("7hQ2…4mBd", 41_200_000, 86.4),
      q("9wKe…Lp31", 28_900_000, 61.2),
      q("2cVt…88Zq", 19_400_000, 40.9),
      q("Ax7u…Rr05", 11_050_000, 23.1),
      q("Ddm4…9ySc", 6_300_000, 13.8),
    ],
    purchases: [
      {
        card: "Pikachu",
        set: "Base Set",
        grader: "PSA",
        grade: 9,
        cert: "PSA 78412290",
        price: 64,
        to: "7hQ2…4mBd",
        sig: "3Kd9…QmZ1",
        ago: "12 min ago",
        destination: "holder",
      },
      {
        card: "Pikachu VMAX",
        set: "Vivid Voltage",
        grader: "CGC",
        grade: 9.5,
        cert: "CGC 4120883",
        price: 41,
        to: "Vau1…7Xn2",
        sig: "8Rt2…Wp7c",
        ago: "1 h ago",
        destination: "vault",
      },
      {
        card: "Pikachu (Surfing)",
        set: "Celebrations",
        grader: "PSA",
        grade: 10,
        cert: "PSA 90114773",
        price: 88,
        to: "9wKe…Lp31",
        sig: "6Yh5…Kb3n",
        ago: "3 h ago",
        destination: "holder",
      },
    ],
  },
  {
    id: "charfloor",
    name: "Charizard Floor",
    ticker: "CHARFLR",
    pokemonId: 6,
    collects: "Charizard",
    gradeFloor: "8+",
    status: "Graduated",
    curveProgress: 100,
    marketCap: 3_120_000,
    volume24h: 1_180_000,
    pot: 2_910,
    cardsSent: 96,
    cardsValue: 18_220,
    holders: 2_740,
    createdAgo: "31 days ago",
    wallet: "ChFl…2nQ8",
    vault: "Vau1…Kz44",
    queue: [
      q("4Nb8…Uu12", 62_800_000, 171.5),
      q("Qq31…Jd70", 33_100_000, 92.0),
      q("8sWx…Ee29", 21_700_000, 58.3),
      q("1Zt6…Ll84", 9_900_000, 26.6),
    ],
    purchases: [
      {
        card: "Charizard EX",
        set: "Obsidian Flames",
        grader: "PSA",
        grade: 9,
        cert: "PSA 81223940",
        price: 97,
        to: "4Nb8…Uu12",
        sig: "2Pl8…Xr4d",
        ago: "26 min ago",
        destination: "holder",
      },
      {
        card: "Charizard",
        set: "Team Up",
        grader: "BGS",
        grade: 8.5,
        cert: "BGS 0017265",
        price: 72,
        to: "Qq31…Jd70",
        sig: "9Cv1…Nb6m",
        ago: "2 h ago",
        destination: "holder",
      },
    ],
  },
  {
    id: "gengarpit",
    name: "Gengar Pit",
    ticker: "GHOST",
    pokemonId: 94,
    collects: "Gengar",
    gradeFloor: "Any",
    status: "Bonding",
    curveProgress: 64,
    marketCap: 184_000,
    volume24h: 96_400,
    pot: 312,
    cardsSent: 27,
    cardsValue: 1_140,
    holders: 418,
    createdAgo: "4 days ago",
    wallet: "Gngr…5tW9",
    vault: "Vau1…Qp18",
    queue: [
      q("6Fj0…Aa53", 18_400_000, 31.2),
      q("3Hn9…Bb77", 12_200_000, 20.4),
      q("Kk22…Cc09", 4_800_000, 8.1),
    ],
    purchases: [
      {
        card: "Gengar VMAX",
        set: "Fusion Strike",
        grader: "CGC",
        grade: 8,
        cert: "CGC 4420911",
        price: 24,
        to: "6Fj0…Aa53",
        sig: "7Mm3…Ty8k",
        ago: "48 min ago",
        destination: "holder",
      },
    ],
  },
  {
    id: "tensonly",
    name: "Tens Only",
    ticker: "GEMMT",
    pokemonId: 150,
    collects: "Any Pokémon",
    gradeFloor: "10s only",
    status: "Bonding",
    curveProgress: 38,
    marketCap: 92_000,
    volume24h: 48_900,
    pot: 168,
    cardsSent: 11,
    cardsValue: 860,
    holders: 261,
    createdAgo: "2 days ago",
    wallet: "TnOn…8dR2",
    vault: "Vau1…Mm60",
    queue: [q("5Pq7…Dd40", 22_600_000, 44.7), q("Ww18…Ee61", 8_100_000, 16.0)],
    purchases: [
      {
        card: "Mewtwo GX",
        set: "Shining Legends",
        grader: "PSA",
        grade: 10,
        cert: "PSA 90551203",
        price: 78,
        to: "5Pq7…Dd40",
        sig: "4Bn6…Uu22",
        ago: "5 h ago",
        destination: "holder",
      },
    ],
  },
  {
    id: "eeveebinder",
    name: "Eevee Binder",
    ticker: "BINDER",
    pokemonId: 133,
    collects: "Eevee",
    gradeFloor: "7+",
    status: "Bonding",
    curveProgress: 81,
    marketCap: 246_000,
    volume24h: 133_500,
    pot: 402,
    cardsSent: 39,
    cardsValue: 1_690,
    holders: 604,
    createdAgo: "9 days ago",
    wallet: "Eeve…3kL7",
    vault: "Vau1…Rt93",
    queue: [q("2Ss4…Ff12", 15_900_000, 27.8), q("Nn90…Gg34", 7_400_000, 12.9)],
    purchases: [
      {
        card: "Eevee Heroes Promo",
        set: "Eevee Heroes",
        grader: "PSA",
        grade: 9,
        cert: "PSA 88203411",
        price: 33,
        to: "2Ss4…Ff12",
        sig: "1Jk4…Pp90",
        ago: "1 h ago",
        destination: "holder",
      },
    ],
  },
  {
    id: "umbreonalt",
    name: "Umbreon Alt",
    ticker: "MOONBRE",
    pokemonId: 197,
    collects: "Umbreon",
    gradeFloor: "9+",
    status: "Graduated",
    curveProgress: 100,
    marketCap: 870_000,
    volume24h: 288_000,
    pot: 744,
    cardsSent: 58,
    cardsValue: 4_310,
    holders: 1_120,
    createdAgo: "17 days ago",
    wallet: "Umbr…6vT1",
    vault: "Vau1…Ss27",
    queue: [q("9Xz2…Hh55", 26_300_000, 55.1), q("Bb73…Ii08", 12_000_000, 25.3)],
    purchases: [
      {
        card: "Umbreon VMAX (Alt Art)",
        set: "Evolving Skies",
        grader: "PSA",
        grade: 9,
        cert: "PSA 87710025",
        price: 99,
        to: "9Xz2…Hh55",
        sig: "5Gh7…Oo11",
        ago: "38 min ago",
        destination: "holder",
      },
    ],
  },
];

export const COINS_BY_ID = Object.fromEntries(COINS.map((c) => [c.id, c])) as Record<string, Coin>;

/** Cross-coin feed, newest first. */
export const CARDS_SENT = COINS.flatMap((c) =>
  c.purchases.map((p) => ({ ...p, coinId: c.id, coinTicker: c.ticker, pokemonId: c.pokemonId })),
);

/** What a launch pick would buy today. */
export const POKEMON_PICKS = [
  { name: "Pikachu", pokemonId: 25 },
  { name: "Charizard", pokemonId: 6 },
  { name: "Blastoise", pokemonId: 9 },
  { name: "Venusaur", pokemonId: 3 },
  { name: "Mewtwo", pokemonId: 150 },
  { name: "Gengar", pokemonId: 94 },
  { name: "Eevee", pokemonId: 133 },
  { name: "Umbreon", pokemonId: 197 },
  { name: "Any Pokémon", pokemonId: 0 },
];

export const GRADE_FLOORS = ["Any", "7+", "8+", "9+", "10s only"];

/** Deterministic estimate of listings + floor price for a pick. */
export function estimatePick(pokemon: string, floor: string) {
  const base = pokemon === "Any Pokémon" ? MARKET.listed : Math.round(MARKET.listed * 0.043);
  const floorFactor: Record<string, number> = {
    Any: 1,
    "7+": 0.78,
    "8+": 0.54,
    "9+": 0.31,
    "10s only": 0.12,
  };
  const priceFactor: Record<string, number> = {
    Any: 1,
    "7+": 1.25,
    "8+": 1.7,
    "9+": 2.6,
    "10s only": 4.4,
  };
  const listings = Math.max(3, Math.round(base * (floorFactor[floor] ?? 1)));
  const cheapest =
    Math.round(
      MARKET.cheapest * (priceFactor[floor] ?? 1) * (pokemon === "Any Pokémon" ? 1 : 1.35) * 100,
    ) / 100;
  return { listings, cheapest };
}
