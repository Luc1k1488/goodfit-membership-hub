import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = 'https://czwwnegeanikobvdndnx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6d3duZWdlYW5pa29idmRuZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjQ4MTUsImV4cCI6MjA2MzAwMDgxNX0.ie8SNrBRKSlfez--tmrsMV4QgznpdxjYEnKTX59Yedc'

// Создаем и экспортируем клиент
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Добавляем в глобальную область для отладки
if (typeof window !== 'undefined') {
  window.supabase = supabase
  console.log('Supabase client now available as window.supabase')
}

// Вспомогательные функции остаются без изменений
export const incrementBookedCount = async (classId: string) => {
  const { error } = await supabase.rpc('increment_booked_count', { class_id: classId })
  if (error) console.error('Error incrementing booked count:', error)
}

export const decrementBookedCount = async (classId: string) => {
  const { error } = await supabase.rpc('decrement_booked_count', { class_id: classId })
  if (error) console.error('Error decrementing booked count:', error)
}

export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession()
  return data.session !== null && !error
}

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

export default supabase
