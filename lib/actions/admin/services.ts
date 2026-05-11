'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { ServiceCategory } from '@/lib/types/service'

function revalidateServices(id?: string) {
  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath('/home')
  if (id) revalidatePath(`/admin/services/${id}/edit`)
}

export type ServiceFormData = {
  name: string
  category: ServiceCategory
  description?: string | null
  basePrice?: number
  isQuoteBased: boolean
  estimatedDuration?: string | null
  includes?: string[]
  isActive: boolean
  iconName?: string | null
}

export async function createService(data: ServiceFormData): Promise<{ id?: string; error?: string }> {
  const supabase = await createServerClient()

  const { data: row, error } = await supabase.from('service_types').insert({
    name: data.name.trim(),
    category: data.category,
    description: data.description?.trim() || null,
    base_price: data.isQuoteBased ? 0 : (data.basePrice ?? 0),
    is_quote_based: data.isQuoteBased,
    estimated_duration: data.estimatedDuration?.trim() || null,
    includes: data.includes ?? [],
    is_active: data.isActive,
    icon_name: data.iconName ?? null,
  }).select('id').single()

  if (error) { console.error('[createService]', error); return { error: 'فشل إنشاء الخدمة' } }
  revalidateServices()
  return { id: row.id }
}

export async function updateService(id: string, data: ServiceFormData): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase.from('service_types').update({
    name: data.name.trim(),
    category: data.category,
    description: data.description?.trim() || null,
    base_price: data.isQuoteBased ? 0 : (data.basePrice ?? 0),
    is_quote_based: data.isQuoteBased,
    estimated_duration: data.estimatedDuration?.trim() || null,
    includes: data.includes ?? [],
    is_active: data.isActive,
    icon_name: data.iconName ?? null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) { console.error('[updateService]', error); return { error: 'فشل تحديث الخدمة' } }
  revalidateServices(id)
  return {}
}

export async function deleteService(id: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  // تحقق من ارتباط الخدمة بطلبات
  const { count } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('service_type_id', id)

  if ((count ?? 0) > 0) return { error: 'لا يمكن حذف الخدمة لأنها مرتبطة بطلبات موجودة' }

  const { error } = await supabase.from('service_types').delete().eq('id', id)
  if (error) { console.error('[deleteService]', error); return { error: 'فشل حذف الخدمة' } }

  revalidateServices()
  return {}
}

export async function toggleServiceActive(id: string, isActive: boolean): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('service_types')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'فشل تحديث حالة الخدمة' }
  revalidateServices()
  return {}
}
