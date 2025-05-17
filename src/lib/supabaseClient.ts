
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = 'https://czwwnegeanikobvdndnx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6d3duZWdlYW5pa29idmRuZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjQ4MTUsImV4cCI6MjA2MzAwMDgxNX0.ie8SNrBRKSlfez--tmrsMV4QgznpdxjYEnKTX59Yedc'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
