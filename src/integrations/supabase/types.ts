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
      item_types: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          sort_order: number
          spans_two_zones: boolean
          updated_at: string
          zone_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          sort_order?: number
          spans_two_zones?: boolean
          updated_at?: string
          zone_key: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          sort_order?: number
          spans_two_zones?: boolean
          updated_at?: string
          zone_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_types_zone_key_fkey"
            columns: ["zone_key"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["key"]
          },
        ]
      }
      items: {
        Row: {
          brand: string | null
          code: string
          condition: string | null
          created_at: string
          era: string | null
          flaws: string | null
          height_cm: number
          id: string
          measurements: Json
          name: string
          notes: string | null
          offset_x: number
          offset_y: number
          original_photos: string[]
          price: number
          processed_image_url: string | null
          scale: number
          size: string | null
          status: Database["public"]["Enums"]["item_status"]
          thumbnail_url: string | null
          type_key: string
          updated_at: string
          zone_key: string
        }
        Insert: {
          brand?: string | null
          code: string
          condition?: string | null
          created_at?: string
          era?: string | null
          flaws?: string | null
          height_cm?: number
          id?: string
          measurements?: Json
          name: string
          notes?: string | null
          offset_x?: number
          offset_y?: number
          original_photos?: string[]
          price?: number
          processed_image_url?: string | null
          scale?: number
          size?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          thumbnail_url?: string | null
          type_key: string
          updated_at?: string
          zone_key: string
        }
        Update: {
          brand?: string | null
          code?: string
          condition?: string | null
          created_at?: string
          era?: string | null
          flaws?: string | null
          height_cm?: number
          id?: string
          measurements?: Json
          name?: string
          notes?: string | null
          offset_x?: number
          offset_y?: number
          original_photos?: string[]
          price?: number
          processed_image_url?: string | null
          scale?: number
          size?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          thumbnail_url?: string | null
          type_key?: string
          updated_at?: string
          zone_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_zone_key_fkey"
            columns: ["zone_key"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["key"]
          },
        ]
      }
      reservations: {
        Row: {
          contact: string
          created_at: string
          customer_name: string
          handled: boolean
          id: string
          item_id: string
          message: string | null
        }
        Insert: {
          contact: string
          created_at?: string
          customer_name: string
          handled?: boolean
          id?: string
          item_id: string
          message?: string | null
        }
        Update: {
          contact?: string
          created_at?: string
          customer_name?: string
          handled?: boolean
          id?: string
          item_id?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          all_label: string
          anchor: string
          anchor_y_cm: number
          created_at: string
          id: string
          key: string
          label: string
          none_label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          all_label?: string
          anchor?: string
          anchor_y_cm?: number
          created_at?: string
          id?: string
          key: string
          label: string
          none_label?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          all_label?: string
          anchor?: string
          anchor_y_cm?: number
          created_at?: string
          id?: string
          key?: string
          label?: string
          none_label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      item_status: "disponibile" | "prenotato" | "venduto"
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
    Enums: {
      app_role: ["admin"],
      item_status: ["disponibile", "prenotato", "venduto"],
    },
  },
} as const
