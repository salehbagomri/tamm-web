'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

function revalidateTechnicians() {
  revalidatePath('/admin/technicians')
  revalidatePath('/admin/dashboard')
}

export async function addTechnician(identifier: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const searchVal = identifier.trim().toLowerCase()

  // جلب الملف الشخصي بالبريد أو الجوال
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, role')
    .or(`email.eq.${searchVal},phone.eq.${searchVal}`)
    .single()

  if (profileErr || !profile) return { error: 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني أو رقم الجوال' }
  if (profile.role !== 'technician') return { error: 'هذا المستخدم ليس فنياً — يجب أن يكون دوره "technician"' }

  // تحقق من عدم وجوده مسبقاً
  const { data: existing } = await supabase
    .from('technicians')
    .select('id')
    .eq('profile_id', profile.id)
    .single()

  if (existing) return { error: 'هذا الفني مضاف مسبقاً' }

  // إضافة الفني
  const { error: insertErr } = await supabase.from('technicians').insert({
    profile_id: profile.id,
    is_available: true,
  })

  if (insertErr) { console.error('[addTechnician]', insertErr); return { error: 'فشل إضافة الفني' } }

  revalidateTechnicians()
  return {}
}

export async function removeTechnician(technicianId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  // حذف من جدول technicians فقط — الحساب يبقى
  const { error } = await supabase.from('technicians').delete().eq('id', technicianId)
  if (error) { console.error('[removeTechnician]', error); return { error: 'فشل إزالة الفني' } }

  revalidateTechnicians()
  return {}
}

export async function toggleTechnicianAvailability(
  technicianId: string,
  isAvailable: boolean
): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('technicians')
    .update({ is_available: isAvailable })
    .eq('id', technicianId)

  if (error) return { error: 'فشل تحديث حالة الفني' }
  revalidateTechnicians()
  return {}
}
