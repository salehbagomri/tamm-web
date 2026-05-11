import { createServerClient } from '@/lib/supabase/server'
import type { Product, ProductCategory } from '@/lib/types/product'

export type AdminProductFilters = {
  category?: ProductCategory | 'all'
  search?: string
  page?: number
  limit?: number
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    category: row.category,
    price: row.price ?? null,
    isPriceOnRequest: row.is_price_on_request ?? false,
    imageUrl: row.image_url ?? null,
    brand: row.brand ?? null,
    specs: row.specs ?? {},
    isAvailable: row.is_available ?? true,
    isFeatured: row.is_featured ?? false,
    requiresInstallation: row.requires_installation ?? false,
    installationPrice: row.installation_price ?? 0,
    oldPrice: row.old_price ?? null,
  }
}

export async function getAdminProducts(
  filters: AdminProductFilters = {}
): Promise<{ products: Product[]; totalCount: number; totalPages: number }> {
  const supabase = await createServerClient()
  const { category, search, page = 1, limit = 20 } = filters
  const offset = (page - 1) * limit

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })

  if (category && category !== 'all') query = query.eq('category', category)
  if (search?.trim()) query = query.ilike('name', `%${search.trim()}%`)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getAdminProducts]', error)
    return { products: [], totalCount: 0, totalPages: 0 }
  }

  return {
    products: (data ?? []).map(mapProduct),
    totalCount: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error || !data) return null
  return mapProduct(data)
}
