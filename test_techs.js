import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Fetching technicians...')
  const { data, error } = await supabase
    .from('technicians')
    .select(`
      id, profile_id, is_available,
      profiles!technicians_profile_id_fkey(full_name, phone, email)
    `)
  console.log('Error:', error)
  console.log('Data:', data)
}

test()
