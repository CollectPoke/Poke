import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().min(1).max(60),
  symbol: z.string().min(1).max(15),
  description: z.string().max(600).optional().default(""),
});

export type PairingSuggestion = {
  pokemon_name: string;
  pokedex_id: number;
  pokemon_types: string[];
  card_type: string;
  rarity: string;
  explanation: string;
};

const CARD_TYPES = ["Fire", "Water", "Grass", "Electric", "Psychic", "Poison", "Normal"];
const RARITIES = ["Common", "Uncommon", "Rare", "Holo Rare", "Legendary"];

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    pokemon_name: { type: "string", description: "The recommended Pokémon's English name" },
    pokedex_id: { type: "integer", description: "National Pokédex number, 1-1025" },
    pokemon_types: {
      type: "array",
      items: { type: "string" },
      description: "The Pokémon's elemental types, e.g. ['Electric']",
    },
    card_type: { type: "string", enum: CARD_TYPES },
    rarity: { type: "string", enum: RARITIES },
    explanation: {
      type: "string",
      description: "Two or three punchy sentences on why this pairing fits the coin.",
    },
  },
  required: ["pokemon_name", "pokedex_id", "pokemon_types", "card_type", "rarity", "explanation"],
} as const;

export const suggestPairing = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<PairingSuggestion> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured yet.");

    const prompt = [
      "You pair memecoins with Pokémon for a trading-card launchpad called Poke.",
      "Pick the single Pokémon whose vibe, typing and lore best match the coin below.",
      "Be witty but specific; reference the coin's actual theme, not generic hype.",
      "",
      `Coin name: ${data.name}`,
      `Symbol: ${data.symbol}`,
      `Description: ${data.description || "(none given)"}`,
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
        text: {
          format: {
            type: "json_schema",
            name: "pokemon_pairing",
            strict: true,
            schema: jsonSchema,
          },
        },
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Too many requests right now — try again shortly.");
      if (res.status === 402)
        throw new Error("AI credits are used up. Top up the workspace to keep pairing.");
      throw new Error(`Pairing failed (${res.status}). ${body.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          } else if (evt.type === "response.completed" && evt.response?.output_text && !text) {
            text = evt.response.output_text;
          }
        } catch {
          // ignore keep-alive / non-JSON frames
        }
      }
    }

    if (!text.trim()) throw new Error("The model did not return a pairing. Try again.");

    let parsed: PairingSuggestion;
    try {
      parsed = JSON.parse(text) as PairingSuggestion;
    } catch {
      throw new Error("The pairing came back in an unexpected shape. Try again.");
    }

    return {
      pokemon_name: String(parsed.pokemon_name ?? "").slice(0, 60),
      pokedex_id: Number(parsed.pokedex_id) || 0,
      pokemon_types: Array.isArray(parsed.pokemon_types)
        ? parsed.pokemon_types.slice(0, 3).map(String)
        : [],
      card_type: CARD_TYPES.includes(parsed.card_type) ? parsed.card_type : "Normal",
      rarity: RARITIES.includes(parsed.rarity) ? parsed.rarity : "Common",
      explanation: String(parsed.explanation ?? "").slice(0, 1000),
    };
  });
