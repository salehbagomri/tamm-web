import { createServerClient } from '@/lib/supabase/server'
import type { StockMovementType } from '@/lib/types/stock-movement'

export type AdminStockMovementFilters = {
  movementType?: StockMovementType | 'all'
  productSearch?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export type AdminStockMovementRow = {
  id: string
  productId: string
  productName: string
  movementType: StockMovementType
  quantityBefore: number
  quantityAfter: number
  quantityChange: number
  notes: string | null
  performedByName: string | null
  orderId: string | null
  orderNumber: string | null
  createdAt: string
}

export async function getAdminStockMovements(
  filters: AdminStockMovementFilters = {}
): Promise<{ movements: AdminStockMovementRow[]; totalCount: number; totalPages: number }> {
  const supabase = await createServerClient()
  const { movementType, productSearch, dateFrom, dateTo, page = 1, limit = 20 } = filters
  const offset = (page - 1) * limit

  let productIdFilter: string[] | null = null
  if (productSearch?.trim()) {
    const { data: matched } = await supabase
      .from('products')
      .select('id')
      .ilike('name', `%${productSearch.trim()}%`)
    productIdFilter = (matched ?? []).map(p => p.id)
    if (productIdFilter.length === 0) {
      return { movements: [], totalCount: 0, totalPages: 0 }
    }
  }

  // products & orders relationships auto-detected; performed_by is FK to auth.users
  // (not public.profiles), so we fetch profiles separately below.
  let query = supabase
    .from('stock_movements')
    .select(
      `id, product_id, movement_type, quantity_before, quantity_after, quantity_change,
       notes, performed_by, order_id, created_at,
       products(name),
       orders(order_number)`,
      { count: 'exact' }
    )

  if (movementType && movementType !== 'all') query = query.eq('movement_type', movementType)
  if (productIdFilter) query = query.in('product_id', productIdFilter)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getAdminStockMovements]', error)
    return { movements: [], totalCount: 0, totalPages: 0 }
  }

  const rows = data ?? []

  // جلب أسماء الـ performers في query منفصل
  const performerIds = Array.from(
    new Set(rows.map((r: any) => r.performed_by).filter((id: string | null): id is string => !!id))
  )
  const nameById = new Map<string, string>()
  if (performerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', performerIds)
    for (const p of profiles ?? []) {
      if (p.full_name) nameById.set(p.id, p.full_name)
    }
  }

  const movements: AdminStockMovementRow[] = rows.map((row: any) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? '—',
    movementType: row.movement_type,
    quantityBefore: row.quantity_before ?? 0,
    quantityAfter: row.quantity_after ?? 0,
    quantityChange: row.quantity_change ?? 0,
    notes: row.notes ?? null,
    performedByName: row.performed_by ? nameById.get(row.performed_by) ?? null : null,
    orderId: row.order_id ?? null,
    orderNumber: row.orders?.order_number ?? null,
    createdAt: row.created_at,
  }))

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / limit)

  return { movements, totalCount, totalPages }
}
