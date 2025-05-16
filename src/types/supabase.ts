
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
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          profile_image?: string | null
          subscription_id?: string | null
        }
      }
      gyms: {
        Row: {
          id: string
          name: string
          description: string
          address: string
          city: string
          main_image: string
          images: string[]
          features: string[]
          category: string[]
          working_hours: {
            open: string
            close: string
          }
          rating: number
          review_count: number
          owner_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          address: string
          city: string
          main_image: string
          images: string[]
          features: string[]
          category: string[]
          working_hours: {
            open: string
            close: string
          }
          rating?: number
          review_count?: number
          owner_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          address?: string
          city?: string
          main_image?: string
          images?: string[]
          features?: string[]
          category?: string[]
          working_hours?: {
            open: string
            close: string
          }
          rating?: number
          review_count?: number
          owner_id?: string | null
        }
      }
      classes: {
        Row: {
          id: string
          gym_id: string
          title: string
          description: string
          instructor: string
          start_time: string
          end_time: string
          category: string
          capacity: number
          booked_count: number
        }
        Insert: {
          id?: string
          gym_id: string
          title: string
          description: string
          instructor: string
          start_time: string
          end_time: string
          category: string
          capacity: number
          booked_count?: number
        }
        Update: {
          id?: string
          gym_id?: string
          title?: string
          description?: string
          instructor?: string
          start_time?: string
          end_time?: string
          category?: string
          capacity?: number
          booked_count?: number
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          class_id: string
          gym_id: string
          status: string
          date_time: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          gym_id: string
          status?: string
          date_time: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          class_id?: string
          gym_id?: string
          status?: string
          date_time?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          name: string
          price: number
          duration_days: number
          features: string[]
          is_popular: boolean
        }
        Insert: {
          id?: string
          name: string
          price: number
          duration_days: number
          features: string[]
          is_popular?: boolean
        }
        Update: {
          id?: string
          name?: string
          price?: number
          duration_days?: number
          features?: string[]
          is_popular?: boolean
        }
      }
    }
  }
}
