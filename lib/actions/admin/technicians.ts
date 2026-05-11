'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

function revalidateTechnicians() {
  revalidatePath('/admin/technicians')
  revalidatePath('/admin/dashboard')
}

export type TechnicianCandidate = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
}

export async function searchCandidate(identifier: string): Promise<{ error?: string, candidate?: TechnicianCandidate }> {
  const supabase = await createServerClient()
  const searchVal = identifier.trim().toLowerCase()

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role')
    .or(`email.eq.${searchVal},phone.eq.${searchVal}`)
    .single()

  if (profileErr || !profile) return { error: 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني أو رقم الجوال' }

  // Check if already in technicians
  const { data: existing } = await supabase
    .from('technicians')
    .select('id')
    .eq('profile_id', profile.id)
    .single()

  if (existing) return { error: 'هذا الفني مضاف مسبقاً في النظام' }

  return {
    candidate: {
      id: profile.id,
      fullName: profile.full_name ?? 'بدون اسم',
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
    }
  }
}

export async function promoteAndAddTechnician(profileId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  // 1. ترقية الدور إلى technician إذا لم يكن كذلك
  const { error: roleErr } = await supabase
    .from('profiles')
    .update({ role: 'technician' })
    .eq('id', profileId)

  if (roleErr) { console.error('[promoteAndAddTechnician role]', roleErr); return { error: 'فشل ترقية المستخدم' } }

  // 2. إضافته إلى جدول technicians
  const { error: insertErr } = await supabase.from('technicians').insert({
    profile_id: profileId,
    is_active: true,
    status: 'available',
  })

  if (insertErr) { console.error('[promoteAndAddTechnician insert]', insertErr); return { error: 'فشل إضافة الفني' } }

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
    .update({ status: isAvailable ? 'available' : 'busy' })
    .eq('id', technicianId)

  if (error) return { error: 'فشل تحديث حالة الفني' }
  revalidateTechnicians()
  return {}
}
