import { createServerClient } from '@/lib/supabase/server'

// ─── تقرير الإيرادات ──────────────────────────────────────────────────────────

export async function getRevenueReport(from: string, to: string) {
  const supabase = await createServerClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, order_type, created_at, include_installation, order_items(unit_price, total_price, quantity, product_id, service_type_id, include_installation)')
    .eq('status', 'completed')
    .gte('created_at', from)
    .lte('created_at', to)

  let productRevenue = 0
  let serviceRevenue = 0
  let installationRevenue = 0
  let totalRevenue = 0
  const dailyRevenue: Record<string, number> = {}

  for (const order of orders ?? []) {
    const amount = Number(order.total_amount)
    totalRevenue += amount

    // تقسيم حسب النوع
    const items = order.order_items as unknown as Array<{
      unit_price: number; total_price: number; quantity: number;
      product_id: string | null; service_type_id: string | null; include_installation: boolean
    }> | null

    if (items) {
      for (const item of items) {
        const baseTotal = item.unit_price * item.quantity
        const installPart = Math.max(0, (item.total_price ?? baseTotal) - baseTotal)

        if (item.product_id) {
          productRevenue += baseTotal
          installationRevenue += installPart
        } else if (item.service_type_id) {
          serviceRevenue += baseTotal
        }
      }
    }

    // إيرادات يومية
    const day = order.created_at.substring(0, 10)
    dailyRevenue[day] = (dailyRevenue[day] ?? 0) + amount
  }

  return {
    totalRevenue,
    productRevenue,
    serviceRevenue,
    installationRevenue,
    orderCount: orders?.length ?? 0,
    dailyRevenue,
  }
}

// ─── تقرير تكلفة البضاعة المباعة (COGS) ─────────────────────────────────────

export async function getCOGSReport(from: string, to: string) {
  const supabase = await createServerClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('order_items(quantity, product_id, products(cost_price))')
    .eq('status', 'completed')
    .gte('created_at', from)
    .lte('created_at', to)

  let totalCOGS = 0

  for (const order of orders ?? []) {
    const items = order.order_items as unknown as Array<{
      quantity: number
      product_id: string | null
      products: { cost_price: number | null } | null
    }> | null

    if (items) {
      for (const item of items) {
        if (item.product_id && item.products?.cost_price) {
          totalCOGS += item.products.cost_price * item.quantity
        }
      }
    }
  }

  return { totalCOGS }
}

// ─── تقرير عمولات الفنيين ─────────────────────────────────────────────────────

export async function getCommissionsReport(from: string, to: string) {
  const supabase = await createServerClient()

  const { data } = await supabase
    .from('technician_earnings')
    .select('commission_amount, is_paid')
    .gte('created_at', from)
    .lte('created_at', to)

  let totalCommissions = 0
  let paidCommissions = 0
  let pendingCommissions = 0

  for (const row of data ?? []) {
    const amount = Number(row.commission_amount)
    totalCommissions += amount
    if (row.is_paid) paidCommissions += amount
    else pendingCommissions += amount
  }

  return { totalCommissions, paidCommissions, pendingCommissions }
}

// ─── أكثر المنتجات مبيعاً ─────────────────────────────────────────────────────

export async function getTopProducts(from: string, to: string, limit = 5) {
  const supabase = await createServerClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('order_items(quantity, unit_price, total_price, product_id, products(name, image_url))')
    .eq('status', 'completed')
    .gte('created_at', from)
    .lte('created_at', to)

  const productMap = new Map<string, { name: string; imageUrl: string | null; totalSold: number; totalRevenue: number }>()

  for (const order of orders ?? []) {
    const items = order.order_items as unknown as Array<{
      quantity: number; unit_price: number; total_price: number;
      product_id: string | null; products: { name: string; image_url: string | null } | null
    }> | null

    if (items) {
      for (const item of items) {
        if (!item.product_id || !item.products) continue
        const existing = productMap.get(item.product_id)
        if (existing) {
          existing.totalSold += item.quantity
          existing.totalRevenue += item.total_price ?? (item.unit_price * item.quantity)
        } else {
          productMap.set(item.product_id, {
            name: item.products.name,
            imageUrl: item.products.image_url,
            totalSold: item.quantity,
            totalRevenue: item.total_price ?? (item.unit_price * item.quantity),
          })
        }
      }
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit)
}

// ─── أكثر الخدمات طلباً ──────────────────────────────────────────────────────

export async function getTopServices(from: string, to: string, limit = 5) {
  const supabase = await createServerClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('order_items(quantity, unit_price, total_price, service_type_id, service_types(name))')
    .eq('status', 'completed')
    .gte('created_at', from)
    .lte('created_at', to)

  const serviceMap = new Map<string, { name: string; totalRequests: number; totalRevenue: number }>()

  for (const order of orders ?? []) {
    const items = order.order_items as unknown as Array<{
      quantity: number; unit_price: number; total_price: number;
      service_type_id: string | null; service_types: { name: string } | null
    }> | null

    if (items) {
      for (const item of items) {
        if (!item.service_type_id || !item.service_types) continue
        const existing = serviceMap.get(item.service_type_id)
        if (existing) {
          existing.totalRequests += item.quantity
          existing.totalRevenue += item.total_price ?? (item.unit_price * item.quantity)
        } else {
          serviceMap.set(item.service_type_id, {
            name: item.service_types.name,
            totalRequests: item.quantity,
            totalRevenue: item.total_price ?? (item.unit_price * item.quantity),
          })
        }
      }
    }
  }

  return Array.from(serviceMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit)
}

// ─── أداء الفنيين ─────────────────────────────────────────────────────────────

export async function getTechnicianPerformance(from: string, to: string) {
  const supabase = await createServerClient()

  const { data } = await supabase
    .from('technician_earnings')
    .select('technician_id, commission_amount, task_type, technicians(profiles(full_name))')
    .gte('created_at', from)
    .lte('created_at', to)

  const techMap = new Map<string, { name: string; taskCount: number; totalEarned: number }>()

  for (const row of data ?? []) {
    const techId = row.technician_id as string
    const tech = row.technicians as unknown as Record<string, unknown> | null
    const profile = tech?.profiles as unknown as Record<string, unknown> | null
    const name = (profile?.full_name as string) ?? 'فني'

    const existing = techMap.get(techId)
    if (existing) {
      existing.taskCount += 1
      existing.totalEarned += Number(row.commission_amount)
    } else {
      techMap.set(techId, { name, taskCount: 1, totalEarned: Number(row.commission_amount) })
    }
  }

  return Array.from(techMap.entries()).map(([id, data]) => ({ technicianId: id, ...data }))
    .sort((a, b) => b.taskCount - a.taskCount)
}

// ─── تفصيل الطلبات بالحالة ────────────────────────────────────────────────────

export async function getOrdersBreakdown(from: string, to: string) {
  const supabase = await createServerClient()

  const { data } = await supabase
    .from('orders')
    .select('status, total_amount')
    .gte('created_at', from)
    .lte('created_at', to)

  const breakdown: Record<string, { count: number; total: number }> = {}

  for (const order of data ?? []) {
    const s = order.status as string
    if (!breakdown[s]) breakdown[s] = { count: 0, total: 0 }
    breakdown[s].count += 1
    breakdown[s].total += Number(order.total_amount)
  }

  return breakdown
}

// ─── تقرير حالة المخزون ──────────────────────────────────────────────────────

export async function getInventoryReport() {
  const supabase = await createServerClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, cost_price, stock_quantity, is_available, image_url')
    .order('stock_quantity', { ascending: true })

  let totalCostValue = 0
  let totalRetailValue = 0
  let lowStockCount = 0
  let outOfStockCount = 0

  const items = (products ?? []).map(p => {
    const costValue = (p.cost_price ?? 0) * p.stock_quantity
    const retailValue = p.price * p.stock_quantity
    totalCostValue += costValue
    totalRetailValue += retailValue
    if (p.stock_quantity === 0) outOfStockCount++
    else if (p.stock_quantity <= 3) lowStockCount++

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      costPrice: p.cost_price ?? 0,
      stockQuantity: p.stock_quantity,
      isAvailable: p.is_available,
      imageUrl: p.image_url,
      costValue,
      retailValue,
    }
  })

  return {
    items,
    totalCostValue,
    totalRetailValue,
    expectedProfit: totalRetailValue - totalCostValue,
    lowStockCount,
    outOfStockCount,
    totalProducts: items.length,
  }
}
