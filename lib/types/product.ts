// أنواع المنتجات — منقولة من Flutter بدقة

export type ProductCategory =
  | 'ac'
  | 'solar_panel'
  | 'solar_battery'
  | 'solar_inverter'
  | 'accessory'

export type ProductImage = {
  id: string
  productId: string
  imageUrl: string
  sortOrder: number
  altText: string | null
}

export type Product = {
  id: string
  name: string
  description: string | null
  category: ProductCategory
  price: number | null
  isPriceOnRequest: boolean
  imageUrl: string | null
  images: ProductImage[]
  brand: string | null
  specs: Record<string, unknown>
  isAvailable: boolean
  isFeatured: boolean
  requiresInstallation: boolean
  installationPrice: number
  oldPrice: number | null
  // حقول المخزون والتكلفة — تظهر فقط في لوحة المدير
  costPrice: number | null
  stockQuantity: number
  lowStockThreshold: number
  supplierName: string | null
  supplierSku: string | null
  autoHideWhenOut: boolean
}
