
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = 'https://wexsmqgachpyghhosrtf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleHNtcWdhY2hweWdoaG9zcnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjgxODYsImV4cCI6MjA2MzA0NDE4Nn0.314twCGQz5INH_zsjrleP_oiX6pZ1t0FLFo_Kt_T0yE'

// Create a single instance of the supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Define the window type extension for debugging
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

export default supabase
