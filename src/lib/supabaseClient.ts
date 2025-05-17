
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = 'https://wexsmqgachpyghhosrtf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleHNtcWdhY2hweWdoaG9zcnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjgxODYsImV4cCI6MjA2MzA0NDE4Nn0.314twCGQz5INH_zsjrleP_oiX6pZ1t0FLFo_Kt_T0yE'

// Create a single instance of the supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Define the window type extension
declare global {
  interface Window {
    supabase: typeof supabase;
  }
}

// Add to global scope for debugging
if (typeof window !== 'undefined') {
  window.supabase = supabase
  console.log('Supabase client now available as window.supabase')
}

// Utility functions
export const incrementBookedCount = async (classId: string) => {
  const { error } = await supabase.rpc('increment_booked_count', { class_id: classId })
  if (error) console.error('Error incrementing booked count:', error)
}

export const decrementBookedCount = async (classId: string) => {
  const { error } = await supabase.rpc('decrement_booked_count', { class_id: classId })
  if (error) console.error('Error decrementing booked count:', error)
}

// User session utility functions moved from types/supabase.ts
export interface SupabaseUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  createdAt: string
  profileImage: string
  subscriptionId: string | null
}

// Authentication utility functions
export const isAuthenticated = async (): Promise<boolean> => {
  const { data, error } = await supabase.auth.getSession()
  return !!data.session && !error
}

export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    console.log("No active session found")
    return null
  }
  
  try {
    const { data, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (userError || !data) {
      console.log("User not found in database:", userError)
      return null
    }
    
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
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

export default supabase
