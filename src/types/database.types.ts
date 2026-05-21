/**
 * Database type definitions for Supabase project `aqsitrzbjokkkpcohple`.
 *
 * This file reflects the schema currently applied to the hosted project.
 * It was transcribed by hand from the authoritative live-schema DDL
 * (operator-confirmed, pasted verbatim from Supabase Studio) because the
 * Supabase CLI is not authenticated on this build path (D-05 — operator
 * applies migrations; CLI login deferred by operator decision).
 *
 * To regenerate from the live schema once CLI auth is available:
 *   npm run gen:types
 * (script: `supabase gen types typescript --project-id aqsitrzbjokkkpcohple`)
 *
 * Pitfall 11 — the generated types are committed and regenerated after every
 * migration. Keep this file in lockstep with supabase/migrations/*.sql.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      action_log: {
        Row: {
          id: string;
          entity_type: string | null;
          entity_id: string | null;
          action: string | null;
          actor: string | null;
          idempotency_key: string | null;
          detail: Json | null;
          executed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          action?: string | null;
          actor?: string | null;
          idempotency_key?: string | null;
          detail?: Json | null;
          executed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          action?: string | null;
          actor?: string | null;
          idempotency_key?: string | null;
          detail?: Json | null;
          executed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      agent_logs: {
        Row: {
          id: string;
          agent_id: string | null;
          run_id: string | null;
          property_id: string | null;
          action: string | null;
          reasoning: string | null;
          shadow_mode: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id?: string | null;
          run_id?: string | null;
          property_id?: string | null;
          action?: string | null;
          reasoning?: string | null;
          shadow_mode?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string | null;
          run_id?: string | null;
          property_id?: string | null;
          action?: string | null;
          reasoning?: string | null;
          shadow_mode?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_logs_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_logs_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "agent_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_logs_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_runs: {
        Row: {
          id: string;
          agent_id: string | null;
          idempotency_key: string | null;
          status: string;
          mode_at_run: string | null;
          trigger: string | null;
          started_at: string | null;
          expected_callback_by: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id?: string | null;
          idempotency_key?: string | null;
          status?: string;
          mode_at_run?: string | null;
          trigger?: string | null;
          started_at?: string | null;
          expected_callback_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string | null;
          idempotency_key?: string | null;
          status?: string;
          mode_at_run?: string | null;
          trigger?: string | null;
          started_at?: string | null;
          expected_callback_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_runs_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      agents: {
        Row: {
          id: string;
          name: string;
          tagline: string | null;
          mode: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          tagline?: string | null;
          mode?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tagline?: string | null;
          mode?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          property_id: string | null;
          guest_id: string | null;
          channel: string | null;
          status: string;
          check_in: string | null;
          check_out: string | null;
          nights: number | null;
          guests_count: number | null;
          total_amount: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          guest_id?: string | null;
          channel?: string | null;
          status?: string;
          check_in?: string | null;
          check_out?: string | null;
          nights?: number | null;
          guests_count?: number | null;
          total_amount?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          guest_id?: string | null;
          channel?: string | null;
          status?: string;
          check_in?: string | null;
          check_out?: string | null;
          nights?: number | null;
          guests_count?: number | null;
          total_amount?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
        ];
      };
      claims: {
        Row: {
          id: string;
          property_id: string | null;
          booking_id: string | null;
          description: string | null;
          amount: number | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          booking_id?: string | null;
          description?: string | null;
          amount?: number | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          booking_id?: string | null;
          description?: string | null;
          amount?: number | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "claims_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claims_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      exceptions: {
        Row: {
          id: string;
          property_id: string | null;
          type: string | null;
          type_label: string | null;
          urgency: string | null;
          category: string | null;
          agent: string | null;
          summary: string | null;
          suggested: string | null;
          source: string | null;
          state: string;
          claimed_by: string | null;
          claimed_at: string | null;
          executed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          type?: string | null;
          type_label?: string | null;
          urgency?: string | null;
          category?: string | null;
          agent?: string | null;
          summary?: string | null;
          suggested?: string | null;
          source?: string | null;
          state?: string;
          claimed_by?: string | null;
          claimed_at?: string | null;
          executed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          type?: string | null;
          type_label?: string | null;
          urgency?: string | null;
          category?: string | null;
          agent?: string | null;
          summary?: string | null;
          suggested?: string | null;
          source?: string | null;
          state?: string;
          claimed_by?: string | null;
          claimed_at?: string | null;
          executed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exceptions_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      guests: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          language: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          language?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          language?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      knowledge_chunks: {
        Row: {
          id: string;
          property_id: string | null;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          content?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      pricing_recs: {
        Row: {
          id: string;
          property_id: string | null;
          run_id: string | null;
          week_start: string | null;
          current_rate: number | null;
          recommended_rate: number | null;
          change_pct: number | null;
          reasoning: string | null;
          status: string;
          executed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          run_id?: string | null;
          week_start?: string | null;
          current_rate?: number | null;
          recommended_rate?: number | null;
          change_pct?: number | null;
          reasoning?: string | null;
          status?: string;
          executed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          run_id?: string | null;
          week_start?: string | null;
          current_rate?: number | null;
          recommended_rate?: number | null;
          change_pct?: number | null;
          reasoning?: string | null;
          status?: string;
          executed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pricing_recs_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pricing_recs_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "agent_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          name: string;
          neighborhood: string;
          type: string;
          rate: number;
          status: string;
          sqft: number | null;
          beds: number | null;
          baths: number | null;
          max_guests: number | null;
          owner: string | null;
          owner_email: string | null;
          owner_phone: string | null;
          comm_pref: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          neighborhood: string;
          type: string;
          rate: number;
          status?: string;
          sqft?: number | null;
          beds?: number | null;
          baths?: number | null;
          max_guests?: number | null;
          owner?: string | null;
          owner_email?: string | null;
          owner_phone?: string | null;
          comm_pref?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          neighborhood?: string;
          type?: string;
          rate?: number;
          status?: string;
          sqft?: number | null;
          beds?: number | null;
          baths?: number | null;
          max_guests?: number | null;
          owner?: string | null;
          owner_email?: string | null;
          owner_phone?: string | null;
          comm_pref?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      turnovers: {
        Row: {
          id: string;
          property_id: string | null;
          booking_id: string | null;
          cleaner: string | null;
          scheduled_for: string | null;
          status: string;
          quality_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          booking_id?: string | null;
          cleaner?: string | null;
          scheduled_for?: string | null;
          status?: string;
          quality_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          booking_id?: string | null;
          cleaner?: string | null;
          scheduled_for?: string | null;
          status?: string;
          quality_score?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "turnovers_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "turnovers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/* ------------------------------------------------------------------ *
 * Convenience helpers — mirror the shape emitted by `supabase gen types`.
 * ------------------------------------------------------------------ */

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
