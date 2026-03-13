import { createClient } from '@supabase/supabase-js'

// API URL fra Supabase (Data API)
const supabaseUrl = 'https://jurjfiaodledkrhfpeps.supabase.co'
// Publishable key fra Supabase (API Keys)
const supabaseAnonKey = 'sb_publishable_Uxx7ASjE-K4yqsEBDWi5fQ_qXbRkIpH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)