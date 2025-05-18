
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
      gyms: {
        Row: {
          id: string
          name: string
          location: Json
          ownerid: string
          description: string
          city: string
          address: string
          category: string[]
          main_image: string
          images: string[]
          features: string[]
          rating: number
          review_count: number
          working_hours: Json
        }
        Insert: {
          id?: string
          name: string
          location: Json
          ownerid: string
          description?: string
          city?: string
          address?: string
          category?: string[]
          main_image?: string
          images?: string[]
          features?: string[]
          rating?: number
          review_count?: number
          working_hours?: Json
        }
        Update: Partial<Database["public"]["Tables"]["gyms"]["Insert"]>
      }
      classes: {
        Row: {
          id: string
          gymid: string
          name: string
          starttime: string
          description?: string
          instructor?: string
          end_time?: string
          category?: string
          capacity?: number
          booked_count?: number
        }
        Insert: {
          id?: string
          gymid: string
          name: string
          starttime: string
          description?: string
          instructor?: string
          end_time?: string
          category?: string
          capacity?: number
          booked_count?: number
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
          gym_id?: string
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          status: string
          date_time: string
          gym_id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>
      }
    }
  }
}
