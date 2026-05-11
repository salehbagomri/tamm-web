import { createServerClient } from '@/lib/supabase/server'
import type { ServiceType } from '@/lib/types/service'

function mapService(row: any): ServiceType {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    category: row.category,
    basePrice: row.base_price ?? 0,
    iconName: row.icon_name ?? null,
    isActive: row.is_active ?? true,
    isQuoteBased: row.is_quote_based ?? false,
    includes: row.includes ?? [],
    estimatedDuration: row.estimated_duration ?? null,
  }
}

export async function getAdminServices(): Promise<ServiceType[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('[getAdminServices]', error); return [] }
  return (data ?? []).map(mapService)
}

export async function getAdminServiceById(id: string): Promise<ServiceType | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from('service_types').select('*').eq('id', id).single()
  if (error || !data) return null
  return mapService(data)
}
