
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
      // Другие таблицы
    }
  }
}
