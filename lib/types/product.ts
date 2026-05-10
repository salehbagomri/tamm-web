// أنواع المنتجات — منقولة من Flutter بدقة

export type ProductCategory =
  | 'ac'
  | 'solar_panel'
  | 'solar_battery'
  | 'solar_inverter'
  | 'accessory'

export type Product = {
  id: string
  name: string
  description: string | null
  category: ProductCategory
  price: number | null
  isPriceOnRequest: boolean
  imageUrl: string | null
  brand: string | null
  specs: Record<string, unknown>
  isAvailable: boolean
  isFeatured: boolean
  requiresInstallation: boolean
  installationPrice: number
  oldPrice: number | null
}
