// أنواع أنواع الخدمات — منقولة من Flutter بدقة

export type ServiceCategory =
  | 'ac_install'
  | 'ac_repair'
  | 'ac_wash'
  | 'ac_maintenance'
  | 'solar_install'
  | 'solar_maintenance'
  | 'consultation'

export type ServiceType = {
  id: string
  name: string
  description: string | null
  category: ServiceCategory
  basePrice: number
  iconName: string | null
  isActive: boolean
  isQuoteBased: boolean
  includes: string[]
  estimatedDuration: string | null
}
