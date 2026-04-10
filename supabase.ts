import { createClient } from '@supabase/supabase-js'

// API URL fra Supabase (Data API)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
// Publishable key fra Supabase (API Keys)
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)