import { createServerClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/lib/types/user'

function mapProfile(raw: any): UserProfile {
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.full_name,
    phone: raw.phone,
    role: raw.role,
    isComplete: raw.is_complete,
    avatarUrl: raw.avatar_url,
    address: raw.address,
    createdAt: raw.created_at,
  }
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data ? mapProfile(data) : null
  } catch {
    return null
  }
}

export interface ProfileStats {
  total: number
  completed: number
  active: number
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('customer_id', userId)

    if (error) throw error

    const rows = data ?? []
    const active = ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress']

    return {
      total: rows.length,
      completed: rows.filter((r) => r.status === 'completed').length,
      active: rows.filter((r) => active.includes(r.status)).length,
    }
  } catch {
    return { total: 0, completed: 0, active: 0 }
  }
}
