import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole, UserProfile } from '@/lib/types/user'

// جلب دور المستخدم من جدول profiles
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data.role as UserRole
}

// جلب بيانات المستخدم الكاملة من جدول profiles
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    role: data.role as UserRole,
    isComplete: data.is_complete,
    avatarUrl: data.avatar_url,
    address: data.address,
    createdAt: data.created_at,
  }
}

// توجيه المستخدم حسب دوره — يُستخدم بعد تسجيل الدخول الناجح
export function getRedirectPathByRole(
  role: UserRole | null,
  isComplete: boolean
): string {
  if (!isComplete) return '/onboarding'
  if (role === 'manager') return '/admin/dashboard'
  return '/home'
}
