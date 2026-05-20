import { cache } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import type { Product, ProductCategory } from '@/lib/types/product'

type RawProduct = {
  id: string; name: string; description: string | null; category: string
  price: number | null; is_price_on_request: boolean; image_url: string | null
  brand: string | null; specs: Record<string, unknown>; is_available: boolean
  is_featured: boolean; requires_installation: boolean
  installation_price: number; old_price: number | null
  stock_quantity?: number; auto_hide_when_out?: boolean
}

function mapProduct(r: RawProduct): Product {
  return {
    id: r.id, name: r.name, description: r.description,
    category: r.category as ProductCategory, price: r.price,
    isPriceOnRequest: r.is_price_on_request, imageUrl: r.image_url,
    brand: r.brand, specs: r.specs, isAvailable: r.is_available,
    isFeatured: r.is_featured, requiresInstallation: r.requires_installation,
    installationPrice: r.installation_price, oldPrice: r.old_price,
    // حقول المخزون — لا نكشف سعر التكلفة للعميل أبداً
    costPrice: null,
    stockQuantity: r.stock_quantity ?? 0,
    lowStockThreshold: 3,
    supplierName: null,
    supplierSku: null,
    autoHideWhenOut: r.auto_hide_when_out ?? true,
  }
}

export interface ProductFilters {
  category?: string
  sort?: string
  search?: string
  page?: number
  limit?: number
}

export interface ProductsResult {
  products: Product[]
  totalCount: number
  totalPages: number
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResult> {
  const { category, sort = 'newest', search, page = 1, limit = 12 } = filters
  try {
    const supabase = await createServerClient()
    let query = supabase.from('products').select('*', { count: 'exact' }).eq('is_available', true)
    // إخفاء المنتجات النافدة التي تم تفعيل الإخفاء التلقائي لها
    query = query.or('stock_quantity.gt.0,auto_hide_when_out.eq.false')

    if (category && category !== 'all') query = query.eq('category', category)
    if (search?.trim()) query = query.ilike('name', `%${search.trim()}%`)

    switch (sort) {
      case 'price_asc':  query = query.order('price', { ascending: true, nullsFirst: false }); break
      case 'price_desc': query = query.order('price', { ascending: false, nullsFirst: false }); break
      case 'featured':   query = query.order('is_featured', { ascending: false }); break
      default:           query = query.order('created_at', { ascending: false })
    }

    const from = (page - 1) * limit
    const { data, count } = await query.range(from, from + limit - 1)

    const totalCount = count ?? 0
    return {
      products: (data as RawProduct[] ?? []).map(mapProduct),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    }
  } catch { return { products: [], totalCount: 0, totalPages: 0 } }
}

// cache() يضمن استدعاء واحد فقط لنفس الـ id في الطلب الواحد
export const getProductById = cache(async (id: string): Promise<Product | null> => {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    return data ? mapProduct(data as RawProduct) : null
  } catch { return null }
})

export async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('products').select('*')
      .eq('category', category).eq('is_available', true)
      .or('stock_quantity.gt.0,auto_hide_when_out.eq.false')
      .neq('id', excludeId).limit(4)
    return (data as RawProduct[] ?? []).map(mapProduct)
  } catch { return [] }
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('products').select('category').eq('is_available', true)
      .or('stock_quantity.gt.0,auto_hide_when_out.eq.false')
    if (!data) return {}
    return (data as { category: string }[]).reduce((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
  } catch { return {} }
}
