import { cache } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import type { ServiceType, ServiceCategory } from '@/lib/types/service'

type RawService = {
  id: string; name: string; description: string | null
  category: string; base_price: number; icon_name: string | null
  is_active: boolean; is_quote_based: boolean
  includes: string[]; estimated_duration: string | null
}

function mapService(r: RawService): ServiceType {
  return {
    id: r.id, name: r.name, description: r.description,
    category: r.category as ServiceCategory, basePrice: r.base_price,
    iconName: r.icon_name, isActive: r.is_active,
    isQuoteBased: r.is_quote_based, includes: r.includes ?? [],
    estimatedDuration: r.estimated_duration,
  }
}

export type GroupedServices = {
  all: ServiceType[]
  ac: ServiceType[]
  solar: ServiceType[]
}

const AC_CATEGORIES = ['ac_install', 'ac_repair', 'ac_wash', 'ac_maintenance']
const SOLAR_CATEGORIES = ['solar_install', 'solar_maintenance', 'consultation']

export async function getGroupedServices(): Promise<GroupedServices> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('service_types').select('*').eq('is_active', true)
      .order('base_price', { ascending: true })

    const all = (data as RawService[] ?? []).map(mapService)
    return {
      all,
      ac: all.filter((s) => AC_CATEGORIES.includes(s.category)),
      solar: all.filter((s) => SOLAR_CATEGORIES.includes(s.category)),
    }
  } catch {
    return { all: [], ac: [], solar: [] }
  }
}

export const getServiceById = cache(async (id: string): Promise<ServiceType | null> => {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase.from('service_types').select('*').eq('id', id).single()
    return data ? mapService(data as RawService) : null
  } catch { return null }
})
