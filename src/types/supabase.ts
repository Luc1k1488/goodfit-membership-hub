
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
      users: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          role: string
          created_at: string
          profile_image: string | null
          subscription_id: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          profile_image?: string | null
          subscription_id?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
      }
      classes: {
        Row: {
          id: string
          gymid: string
          name: string
          starttime: string
        }
        Insert: {
          id?: string
          gymid: string
          name: string
          starttime: string
        }
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          class_id: string
          status: string
          date_time: string
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          status: string
          date_time: string
        }
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>
      }
      gyms: {
        Row: {
          id: string
          name: string
          location: Json
          ownerid: string
        }
        Insert: {
          id?: string
          name: string
          location: Json
          ownerid: string
        }
        Update: Partial<Database["public"]["Tables"]["gyms"]["Insert"]>
      }
    }
  }
}

// Note: Supabase client initialization moved to src/lib/supabaseClient.ts
// Import it from there instead of creating multiple instances
