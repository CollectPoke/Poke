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

export function formatSolAmount(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} SOL`;
}
