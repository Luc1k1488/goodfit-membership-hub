
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = 'https://czwwnegeanikobvdndnx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6d3duZWdlYW5pa29idmRuZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjQ4MTUsImV4cCI6MjA2MzAwMDgxNX0.ie8SNrBRKSlfez--tmrsMV4QgznpdxjYEnKTX59Yedc'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper functions for common Supabase operations

// Increment the booked count for a class
export const incrementBookedCount = async (classId: string) => {
  const { error } = await supabase.rpc('increment_booked_count', { class_id: classId })
  if (error) console.error('Error incrementing booked count:', error)
}

// Decrement the booked count for a class
export const decrementBookedCount = async (classId: string) => {
  const { error } = await supabase.rpc('decrement_booked_count', { class_id: classId })
  if (error) console.error('Error decrementing booked count:', error)
}

// Check if a user is authenticated
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession()
  return data.session !== null && !error
}

// Get current user data
export const getCurrentUser = async () => {
  const { data: authData } = await supabase.auth.getSession()
  
  if (!authData.session) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.session.user.id)
    .single()
    
  if (error) {
    console.error('Error fetching user data:', error)
    return null
  }
  
  return {
    id: data.id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    role: data.role,
    createdAt: data.created_at,
    profileImage: data.profile_image || '/placeholder.svg'
  }
}

// SQL to be executed on Supabase:
/*
-- Create stored procedure to increment booked_count
CREATE OR REPLACE FUNCTION increment_booked_count(class_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE classes 
  SET booked_count = booked_count + 1
  WHERE id = class_id;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure to decrement booked_count
CREATE OR REPLACE FUNCTION decrement_booked_count(class_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE classes 
  SET booked_count = GREATEST(0, booked_count - 1)
  WHERE id = class_id;
END;
$$ LANGUAGE plpgsql;
*/
