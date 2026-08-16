// src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          privacy_opt_in: boolean;
          role: "enthusiast" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          privacy_opt_in?: boolean;
          role?: "enthusiast" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          privacy_opt_in?: boolean;
          role?: "enthusiast" | "admin";
          created_at?: string;
        };
        Relationships: [];
      };
      coasters: {
        Row: {
          id: string;
          name: string;
          park: string;
          country: string;
          manufacturer: string;
          type: "steel" | "wooden" | "hybrid" | "other";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          park: string;
          country: string;
          manufacturer: string;
          type: "steel" | "wooden" | "hybrid" | "other";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          park?: string;
          country?: string;
          manufacturer?: string;
          type?: "steel" | "wooden" | "hybrid" | "other";
          created_at?: string;
        };
        Relationships: [];
      };
      rides: {
        Row: {
          id: string;
          user_id: string;
          coaster_id: string;
          ridden_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coaster_id: string;
          ridden_at: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          coaster_id?: string;
          ridden_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rides_coaster_id_fkey";
            columns: ["coaster_id"];
            isOneToOne: false;
            referencedRelation: "coasters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rides_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      // Aggregates credits/rides per opted-in user, server-side. See
      // src/actions/leaderboard.ts for why this is a SECURITY DEFINER
      // function rather than a client-side query.
      get_leaderboard: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          display_name: string;
          credit_count: number;
          total_rides: number;
        }[];
      };
    };
    Enums: {
      coaster_type: "steel" | "wooden" | "hybrid" | "other";
      user_role: "enthusiast" | "admin";
    };
    CompositeTypes: Record<string, never>;
  };
}

// ---------------------------------------------------------------------------
// Generic helpers, mirroring the shape Supabase's own CLI-generated types use
// ---------------------------------------------------------------------------

type PublicSchema = Database["public"];

export type TableRow<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TableInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TableUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

// ---------------------------------------------------------------------------
// Per-table convenience aliases
// ---------------------------------------------------------------------------

export type Profile = TableRow<"profiles">;
export type ProfileInsert = TableInsert<"profiles">;
export type ProfileUpdate = TableUpdate<"profiles">;

export type Coaster = TableRow<"coasters">;
export type CoasterInsert = TableInsert<"coasters">;
export type CoasterUpdate = TableUpdate<"coasters">;

export type Ride = TableRow<"rides">;
export type RideInsert = TableInsert<"rides">;
export type RideUpdate = TableUpdate<"rides">;
