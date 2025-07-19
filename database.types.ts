export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          email: string
          id: string
          name: string
          role?: string
        }
        Update: {
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          description: string | null
          gemini_api_key: string | null
          points: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          description?: string | null
          gemini_api_key?: string | null
          points?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          description?: string | null
          gemini_api_key?: string | null
          points?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      game_results: {
        Row: {
          id: string
          guesser_id: string
          assigned_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          guesser_id: string
          assigned_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          guesser_id?: string
          assigned_user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_results_guesser_id_fkey"
            columns: ["guesser_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_results_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_custom_role_to_jwt: {
        Args: {
          event: Json
        }
        Returns: Json
      }
      set_user_role: {
        Args: {
          event: Json
        }
        Returns: Json
      }
      get_random_user_for_assignment: {
        Args: {
          guesser_user_id: string
        }
        Returns: string
      }
      award_points_for_correct_guess: {
        Args: {
          guesser_user_id: string
          assigned_user_id: string
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
// Additional types for the application
export type Profile = Database['public']['Tables']['profiles']['Row']
export type GameResult = Database['public']['Tables']['game_results']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type GameResultInsert = Database['public']['Tables']['game_results']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type GameResultUpdate = Database['public']['Tables']['game_results']['Update']

// Profile form data interface
export interface ProfileFormData {
  display_name: string
  college_name?: string
  favourite_hobby?: string
  favourite_dish?: string
  favourite_sportsperson?: string
  best_movie?: string
  relationship_status?: 'Single' | 'Committed'
  additional_description?: string
  gemini_api_key: string
}

// User statistics interface
export interface UserStats {
  total_points: number
  successful_guesses: number
  times_guessed: number
  games_played: number
}

// Game history item interface
export interface GameHistoryItem {
  id: string
  opponent_name: string
  role: 'guesser' | 'guessed'
  result: 'success' | 'failure'
  points: number
  date: string
}