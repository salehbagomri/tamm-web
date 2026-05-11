
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const search = 'صالح';
  
  const { data: matchedProfiles } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', `%${search}%`)
  
  const profileIds = matchedProfiles?.map(p => p.id) || []
  let orCondition = `order_number.ilike.%${search}%`;
  if (profileIds.length > 0) {
    orCondition += `,customer_id.in.(${profileIds.join(',')})`;
  }

  const { data, count, error } = await supabase
    .from('orders')
    .select(
      `id, order_number, order_type, status, total_amount, address,
       preferred_date, preferred_time_slot, notes, created_at,
       quote_status, quote_price,
       profiles!orders_customer_id_fkey(full_name, phone),
       assignments(technicians(profiles(full_name)))`,
      { count: 'exact' }
    )
    .or(orCondition)
    .limit(1)

  console.log('Error:', error);
  console.log('Data:', data);
}

test();
