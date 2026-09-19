export type Slab = {
  id: string;
  cardName: string;
  set: string;
  year: number;
  grader: "PSA" | "BGS" | "CGC";
  grade: number;
  label: string;
  /** artwork source */
  pokemonId: number;
  paid: number;
  boughtOn: string;
  fundedBy: string;
  cert: string;
  status: "Vaulted" | "In grading" | "In transit";
};

/** Cards the trading fees have bought so far. */
export const VAULT: Slab[] = [
  {
    id: "slab-001",
    cardName: "Charizard",
    set: "Base Set Shadowless",
    year: 1999,
    grader: "PSA",
    grade: 9,
    label: "MINT",
    pokemonId: 6,
    paid: 18400,
    boughtOn: "2026-08-14",
    fundedBy: "DOGE",
    cert: "PSA 78412290",
    status: "Vaulted",
  },
  {
    id: "slab-002",
    cardName: "Blastoise",
    set: "Base Set Unlimited",
    year: 1999,
    grader: "PSA",
    grade: 10,
    label: "GEM MT",
    pokemonId: 9,
    paid: 12250,
    boughtOn: "2026-08-29",
    fundedBy: "PEPE",
    cert: "PSA 90114773",
    status: "Vaulted",
  },
  {
    id: "slab-003",
    cardName: "Umbreon VMAX (Alt Art)",
    set: "Evolving Skies",
    year: 2021,
    grader: "PSA",
    grade: 10,
    label: "GEM MT",
    pokemonId: 197,
    paid: 2980,
    boughtOn: "2026-09-02",
    fundedBy: "WIF",
    cert: "PSA 88203411",
    status: "Vaulted",
  },
  {
    id: "slab-004",
    cardName: "Pikachu Illustrator (reprint)",
    set: "Van Gogh Museum Promo",
    year: 2023,
    grader: "CGC",
    grade: 9.5,
    label: "MINT+",
    pokemonId: 25,
    paid: 1450,
    boughtOn: "2026-09-08",
    fundedBy: "BONK",
    cert: "CGC 4120883",
    status: "Vaulted",
  },
  {
    id: "slab-005",
    cardName: "Mewtwo",
    set: "Base Set 1st Edition",
    year: 1999,
    grader: "BGS",
    grade: 9.5,
    label: "GEM MT",
    pokemonId: 150,
    paid: 7600,
    boughtOn: "2026-09-12",
    fundedBy: "POPCAT",
    cert: "BGS 0017265",
    status: "In transit",
  },
  {
    id: "slab-006",
    cardName: "Lugia",
    set: "Neo Genesis",
    year: 2000,
    grader: "PSA",
    grade: 8,
    label: "NM-MT",
    pokemonId: 249,
    paid: 3180,
    boughtOn: "2026-09-17",
    fundedBy: "FARTCOIN",
    cert: "pending",
    status: "In grading",
  },
];

export const vaultTotals = () => {
  const spent = VAULT.reduce((s, c) => s + c.paid, 0);
  const vaulted = VAULT.filter((c) => c.status === "Vaulted").length;
  return { spent, vaulted, count: VAULT.length };
};
