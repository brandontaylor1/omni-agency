export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      athletes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          current_team: string
          position: string
          jersey_number: number | null
          height_inches: number | null
          weight_lbs: number | null
          hometown: string | null
          high_school: string | null
          previous_colleges: string[] | null
          current_grade: string | null
          nil_tier: string | null
          nil_value: number | null
          total_contract_value: number | null
          org_id: string
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          current_team: string
          position: string
          jersey_number?: number | null
          height_inches?: number | null
          weight_lbs?: number | null
          hometown?: string | null
          high_school?: string | null
          previous_colleges?: string[] | null
          current_grade?: string | null
          nil_tier?: string | null
          nil_value?: number | null
          total_contract_value?: number | null
          org_id: string
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          current_team?: string
          position?: string
          jersey_number?: number | null
          height_inches?: number | null
          weight_lbs?: number | null
          hometown?: string | null
          high_school?: string | null
          previous_colleges?: string[] | null
          current_grade?: string | null
          nil_tier?: string | null
          nil_value?: number | null
          total_contract_value?: number | null
          org_id?: string
          image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      org_members: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          org_id: string
          user_id: string
          role: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          org_id: string
          user_id: string
          role: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          org_id?: string
          user_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          athlete_id: string | null
          title: string
          description: string | null
          date: string
          type: 'athlete' | 'meeting' | 'travel' | 'game' | 'signing' | 'appearance' | 'football_camp' | 'other'
          fulfilled: boolean
          created_by: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          athlete_id?: string | null
          title: string
          description?: string | null
          date: string
          type: 'athlete' | 'meeting' | 'travel' | 'game' | 'signing' | 'appearance' | 'football_camp' | 'other'
          fulfilled?: boolean
          created_by: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id?: string
          athlete_id?: string | null
          title?: string
          description?: string | null
          date?: string
          type?: 'athlete' | 'meeting' | 'travel' | 'game' | 'signing' | 'appearance' | 'football_camp' | 'other'
          fulfilled?: boolean
          created_by?: string
          metadata?: Json | null
        }
      }
      calendar_tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          title: string
          date: string
          completed: boolean
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          title: string
          date: string
          completed?: boolean
          created_by?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id?: string
          title?: string
          date?: string
          completed?: boolean
          created_by?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          settings?: Json
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string // This should match the auth.users id
          first_name: string
          last_name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      org_members: {
        Row: {
          org_id: string
          user_id: string
          role: 'owner' | 'admin' | 'agent' | 'staff' | 'analyst' | 'read_only'
        }
        Insert: {
          org_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'agent' | 'staff' | 'analyst' | 'read_only'
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'agent' | 'staff' | 'analyst' | 'read_only'
        }
      },
      contracts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          org_id: string
          athlete_id: string
          title: string
          partner: string
          type: 'endorsement' | 'nil' | 'professional'
          value: number
          start_date: string
          end_date: string
          status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated'
          payment_schedule: Json[]
          terms_document_url: string | null
          created_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          org_id: string
          athlete_id: string
          title: string
          partner: string
          type: 'endorsement' | 'nil' | 'professional'
          value: number
          start_date: string
          end_date: string
          status?: 'draft' | 'pending' | 'active' | 'expired' | 'terminated'
          payment_schedule?: Json[]
          terms_document_url?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          org_id?: string
          athlete_id?: string
          title?: string
          partner?: string
          type?: 'endorsement' | 'nil' | 'professional'
          value?: number
          start_date?: string
          end_date?: string
          status?: 'draft' | 'pending' | 'active' | 'expired' | 'terminated'
          payment_schedule?: Json[]
          terms_document_url?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_athlete_id_fkey"
            columns: ["athlete_id"]
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      contract_payments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          contract_id: string
          amount: number
          due_date: string
          paid_date: string | null
          status: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          contract_id: string
          amount: number
          due_date: string
          paid_date?: string | null
          status?: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          contract_id?: string
          amount?: number
          due_date?: string
          paid_date?: string | null
          status?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_payments_contract_id_fkey"
            columns: ["contract_id"]
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          }
        ]
      }
      athletes: {
        Row: {
          id: string
          org_id: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          status: string
          position: string | null
          jersey_number: number | null
          height_ft_in: string | null
          weight_lbs: number | null
          college: string | null
          nfl_team: string | null
          draft_year: number | null
          draft_round: string | null
          draft_selection: string | null
          draft_round_projection: string | null
          hometown: string | null
          high_school: string | null
          hs_coach: string | null
          hs_coach_phone: string | null
          previous_colleges: string[] | null
          current_grade: string | null
          speed: string | null
          hand_size: string | null
          arm_length: string | null
          wingspan: string | null
          bio: string | null
          achievements: string | null
          state: string | null
          country: string | null
          email: string | null
          phone: string | null
          instagram: string | null
          twitter: string | null
          tiktok: string | null
          image_url: string | null
          nil_tier: string | null
          nil_value: number | null
          total_contract_value: number | null
          mother_name: string | null
          mother_phone: string | null
          mother_email: string | null
          mother_occupation: string | null
          mother_company: string | null
          mother_address: string | null
          father_name: string | null
          father_phone: string | null
          father_email: string | null
          father_occupation: string | null
          father_company: string | null
          father_address: string | null
          same_address_as_mother: boolean | null
          siblings: string | null
          scouting_reports: Json | null
          nfl_feedback: string | null
          nfl_value: string | null
          nfl_value_grade: string | null
          nfl_contract_years: string | null
          nfl_contract_value: string | null
          nfl_contract_aav: string | null
          agency_interest: boolean | null
          notes: string | null
          current_team: string | null
          sport: string
          created_at: string
          updated_at: string
          created_by: string | null
          stats: Json | null
          metrics: Json | null
        }
        Insert: {
          id?: string
          org_id: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          status?: string
          position?: string | null
          jersey_number?: number | null
          height_ft_in?: string | null
          weight_lbs?: number | null
          college?: string | null
          nfl_team?: string | null
          draft_year?: number | null
          draft_round?: string | null
          draft_selection?: string | null
          draft_round_projection?: string | null
          hometown?: string | null
          high_school?: string | null
          hs_coach?: string | null
          hs_coach_phone?: string | null
          previous_colleges?: string[] | null
          current_grade?: string | null
          speed?: string | null
          hand_size?: string | null
          arm_length?: string | null
          wingspan?: string | null
          bio?: string | null
          achievements?: string | null
          state?: string | null
          country?: string | null
          email?: string | null
          phone?: string | null
          instagram?: string | null
          twitter?: string | null
          tiktok?: string | null
          image_url?: string | null
          nil_tier?: string | null
          nil_value?: number | null
          total_contract_value?: number | null
          mother_name?: string | null
          mother_phone?: string | null
          mother_email?: string | null
          mother_occupation?: string | null
          mother_company?: string | null
          mother_address?: string | null
          father_name?: string | null
          father_phone?: string | null
          father_email?: string | null
          father_occupation?: string | null
          father_company?: string | null
          father_address?: string | null
          same_address_as_mother?: boolean | null
          siblings?: string | null
          scouting_reports?: Json | null
          nfl_feedback?: string | null
          nfl_value?: string | null
          nfl_value_grade?: string | null
          nfl_contract_years?: string | null
          nfl_contract_value?: string | null
          nfl_contract_aav?: string | null
          agency_interest?: boolean | null
          notes?: string | null
          current_team?: string | null
          sport?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          stats?: Json | null
          metrics?: Json | null
        }
        Update: {
          id?: string
          org_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          status?: string
          position?: string | null
          jersey_number?: number | null
          height_ft_in?: string | null
          weight_lbs?: number | null
          college?: string | null
          nfl_team?: string | null
          draft_year?: number | null
          draft_round?: string | null
          draft_selection?: string | null
          draft_round_projection?: string | null
          hometown?: string | null
          high_school?: string | null
          hs_coach?: string | null
          hs_coach_phone?: string | null
          previous_colleges?: string[] | null
          current_grade?: string | null
          speed?: string | null
          hand_size?: string | null
          arm_length?: string | null
          wingspan?: string | null
          bio?: string | null
          achievements?: string | null
          state?: string | null
          country?: string | null
          email?: string | null
          phone?: string | null
          instagram?: string | null
          twitter?: string | null
          tiktok?: string | null
          image_url?: string | null
          nil_tier?: string | null
          nil_value?: number | null
          total_contract_value?: number | null
          mother_name?: string | null
          mother_phone?: string | null
          mother_email?: string | null
          mother_occupation?: string | null
          mother_company?: string | null
          mother_address?: string | null
          father_name?: string | null
          father_phone?: string | null
          father_email?: string | null
          father_occupation?: string | null
          father_company?: string | null
          father_address?: string | null
          same_address_as_mother?: boolean | null
          siblings?: string | null
          scouting_reports?: Json | null
          nfl_feedback?: string | null
          nfl_value?: string | null
          nfl_value_grade?: string | null
          nfl_contract_years?: string | null
          nfl_contract_value?: string | null
          nfl_contract_aav?: string | null
          agency_interest?: boolean | null
          notes?: string | null
          current_team?: string | null
          sport?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          stats?: Json | null
          metrics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // Types for remaining tables will be added as we create them
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_org_member: {
        Args: { target_org: string }
        Returns: boolean
      }
    }
    Enums: {
      role: 'owner' | 'admin' | 'agent' | 'staff' | 'analyst' | 'read_only'
      player_level: 'hs' | 'college' | 'nfl'
      value_tier: 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4' | 'tier_5'
      comm_channel: 'phone' | 'sms' | 'email' | 'in_person' | 'social'
      comm_direction: 'inbound' | 'outbound'
      contract_type: 'endorsement' | 'nil' | 'professional'
      contract_status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated'
    }
  }
}
