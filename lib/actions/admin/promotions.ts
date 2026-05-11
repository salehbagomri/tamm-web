'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

function revalidatePromotions() {
  revalidatePath('/admin/promotions')
  revalidatePath('/home')
}

export async function togglePromotionStatus(id: string, isActive: boolean) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('promotions')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: 'فشل تحديث حالة العرض' }
  revalidatePromotions()
  return {}
}

export async function deletePromotion(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id)

  if (error) return { error: 'فشل حذف العرض' }
  revalidatePromotions()
  return {}
}

export async function savePromotion(data: {
  id?: string
  title: string
  subtitle: string
  iconName: string
  gradientStart: string
  gradientEnd: string
  destination: string
  sortOrder: number
}) {
  const supabase = await createServerClient()
  
  const payload = {
    title: data.title,
    subtitle: data.subtitle || null,
    icon_name: data.iconName || null,
    gradient_start: data.gradientStart || null,
    gradient_end: data.gradientEnd || null,
    destination: data.destination || null,
    sort_order: data.sortOrder,
  }

  if (data.id) {
    const { error } = await supabase.from('promotions').update(payload).eq('id', data.id)
    if (error) return { error: 'فشل تحديث العرض' }
  } else {
    const { error } = await supabase.from('promotions').insert({ ...payload, is_active: true })
    if (error) return { error: 'فشل إضافة العرض' }
  }

  revalidatePromotions()
  return {}
}
