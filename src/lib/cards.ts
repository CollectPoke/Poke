export const CARD_TYPES = [
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Psychic",
  "Poison",
  "Normal",
] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const RARITIES = ["Common", "Uncommon", "Rare", "Holo Rare", "Legendary"] as const;
export type Rarity = (typeof RARITIES)[number];

export type CardRow = {
  id: string;
  name: string;
  name_key: string;
  ticker: string;
  description: string | null;
  image_url: string | null;
  contract_address: string;
  creator_id: string;
  owner_id: string;
  status: string;
  list_price: number | null;
  last_price: number | null;
  mint_price: number;
  launch_id?: string | null;
  launch_tx_signature?: string | null;
  created_at: string;
};

export type CardWithPeople = CardRow & {
  owner?: { username: string } | null;
  creator?: { username: string } | null;
};

export function shortAddress(address: string, size = 5): string {
  if (address.length <= size * 2 + 3) return address;
  return `${address.slice(0, size)}…${address.slice(-size)}`;
}

/** Background / text classes for an element type. */
export function typeStyle(type: string): { chip: string; art: string } {
  switch (type) {
    case "Fire":
      return { chip: "bg-type-fire/15 text-type-fire", art: "from-type-fire/25 to-brand/30" };
    case "Water":
      return {
        chip: "bg-type-water/15 text-type-water",
        art: "from-type-water/25 to-link/25",
      };
    case "Grass":
      return {
        chip: "bg-type-grass/15 text-type-grass",
        art: "from-type-grass/25 to-success/25",
      };
    case "Electric":
      return {
        chip: "bg-type-electric/20 text-type-electric",
        art: "from-brand/40 to-type-electric/20",
      };
    case "Psychic":
      return {
        chip: "bg-type-psychic/15 text-type-psychic",
        art: "from-type-psychic/25 to-violet/25",
      };
    case "Poison":
      return {
        chip: "bg-type-poison/15 text-type-poison",
        art: "from-type-poison/25 to-violet/20",
      };
    default:
      return { chip: "bg-muted text-muted-foreground", art: "from-muted to-secondary" };
  }
}

export function rarityStyle(rarity: string): string {
  switch (rarity) {
    case "Legendary":
      return "bg-violet text-white";
    case "Holo Rare":
      return "bg-link text-white";
    case "Rare":
      return "bg-danger text-white";
    case "Uncommon":
      return "bg-success text-white";
    default:
      return "bg-ink/10 text-foreground";
  }
}

export function formatSolAmount(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} SOL`;
}
