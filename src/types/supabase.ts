
import { createClient } from '@supabase/supabase-js'

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
      // другие таблицы можно подключить при необходимости
    }
  }
}

// Supabase client
const supabaseUrl = 'https://czwwnegeanikobvdndnx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6d3duZWdlYW5pa29idmRuZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjQ4MTUsImV4cCI6MjA2MzAwMDgxNX0.ie8SNrBRKSlfez--tmrsMV4QgznpdxjYEnKTX59Yedc'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Типизированный пользователь
export type SupabaseUser = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  createdAt: string
  profileImage: string
  subscriptionId: string | null
}

// Получение текущей сессии и пользователя
export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) return null

  const { data, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (userError || !data) return null

  return {
    id: data.id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    role: data.role,
    createdAt: data.created_at,
    profileImage: data.profile_image || '/placeholder.svg',
    subscriptionId: data.subscription_id
  }
}

// Проверка авторизован ли пользователь
export const isAuthenticated = async (): Promise<boolean> => {
  const { data, error } = await supabase.auth.getSession()
  return !!data.session && !error
}
