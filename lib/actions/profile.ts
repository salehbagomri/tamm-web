'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface ProfileUpdateData {
  fullName: string
  phone: string
  address: string
}

type UpdateResult = { success: true } | { error: string }

export async function updateProfile(data: ProfileUpdateData): Promise<UpdateResult> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      phone: data.phone,
      address: data.address || null,
      is_complete: true,
    })
    .eq('id', user.id)

  if (error) return { error: 'حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مجدداً' }

  revalidatePath('/profile')
  return { success: true }
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.rpc('delete_user_account')
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
