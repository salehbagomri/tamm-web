import { createServerClient } from '@/lib/supabase/server'

export type AdminPromotion = {
  id: string
  title: string
  subtitle: string | null
  iconName: string | null
  gradientStart: string | null
  gradientEnd: string | null
  destination: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export async function getAdminPromotions(): Promise<AdminPromotion[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data) {
    console.error('[getAdminPromotions]', error)
    return []
  }

  return data.map((p: any) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    iconName: p.icon_name,
    gradientStart: p.gradient_start,
    gradientEnd: p.gradient_end,
    destination: p.destination,
    sortOrder: p.sort_order,
    isActive: p.is_active,
    createdAt: p.created_at,
  }))
}

export async function getAdminPromotionById(id: string): Promise<AdminPromotion | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    iconName: data.icon_name,
    gradientStart: data.gradient_start,
    gradientEnd: data.gradient_end,
    destination: data.destination,
    sortOrder: data.sort_order,
    isActive: data.is_active,
    createdAt: data.created_at,
  }
}
