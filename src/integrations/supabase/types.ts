export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artwork: {
        Row: {
          created_at: string
          data: string
          id: string
          mime: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          mime: string
          owner_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          mime?: string
          owner_id?: string
        }
        Relationships: []
      }
      buybacks: {
        Row: {
          created_at: string
          executed_at: string
          id: string
          poke_bought: number
          sol_spent: number
          tx_signature: string
        }
        Insert: {
          created_at?: string
          executed_at?: string
          id?: string
          poke_bought?: number
          sol_spent?: number
          tx_signature: string
        }
        Update: {
          created_at?: string
          executed_at?: string
          id?: string
          poke_bought?: number
          sol_spent?: number
          tx_signature?: string
        }
        Relationships: []
      }
      card_events: {
        Row: {
          actor_id: string | null
          card_id: string
          counterparty_id: string | null
          created_at: string
          id: string
          kind: string
          price: number | null
          tx_signature: string | null
        }
        Insert: {
          actor_id?: string | null
          card_id: string
          counterparty_id?: string | null
          created_at?: string
          id?: string
          kind: string
          price?: number | null
          tx_signature?: string | null
        }
        Update: {
          actor_id?: string | null
          card_id?: string
          counterparty_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          price?: number | null
          tx_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_events_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_events_counterparty_id_fkey"
            columns: ["counterparty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          card_type: string
          contract_address: string
          created_at: string
          creator_id: string
          description: string | null
          id: string
          image_url: string | null
          last_price: number | null
          list_price: number | null
          mint_price: number
          name: string
          name_key: string
          owner_id: string
          rarity: string
          status: string
          ticker: string
        }
        Insert: {
          card_type?: string
          contract_address: string
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          image_url?: string | null
          last_price?: number | null
          list_price?: number | null
          mint_price?: number
          name: string
          name_key: string
          owner_id: string
          rarity?: string
          status?: string
          ticker: string
        }
        Update: {
          card_type?: string
          contract_address?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          image_url?: string | null
          last_price?: number | null
          list_price?: number | null
          mint_price?: number
          name?: string
          name_key?: string
          owner_id?: string
          rarity?: string
          status?: string
          ticker?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pairings: {
        Row: {
          card_type: string | null
          coin_description: string | null
          coin_name: string
          coin_symbol: string
          created_at: string
          created_by: string | null
          explanation: string
          id: string
          pokedex_id: number | null
          pokemon_name: string
          pokemon_types: string[]
          rarity: string
        }
        Insert: {
          card_type?: string | null
          coin_description?: string | null
          coin_name: string
          coin_symbol: string
          created_at?: string
          created_by?: string | null
          explanation: string
          id?: string
          pokedex_id?: number | null
          pokemon_name: string
          pokemon_types?: string[]
          rarity?: string
        }
        Update: {
          card_type?: string | null
          coin_description?: string | null
          coin_name?: string
          coin_symbol?: string
          created_at?: string
          created_by?: string | null
          explanation?: string
          id?: string
          pokedex_id?: number | null
          pokemon_name?: string
          pokemon_types?: string[]
          rarity?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          id: string
          username: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          created_at: string
          public_key: string
          secret_ciphertext: string
          user_id: string
        }
        Insert: {
          created_at?: string
          public_key: string
          secret_ciphertext: string
          user_id: string
        }
        Update: {
          created_at?: string
          public_key?: string
          secret_ciphertext?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buy_card: {
        Args: { _buyer_id: string; _card_id: string }
        Returns: {
          card_type: string
          contract_address: string
          created_at: string
          creator_id: string
          description: string | null
          id: string
          image_url: string | null
          last_price: number | null
          list_price: number | null
          mint_price: number
          name: string
          name_key: string
          owner_id: string
          rarity: string
          status: string
          ticker: string
        }
        SetofOptions: {
          from: "*"
          to: "cards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
