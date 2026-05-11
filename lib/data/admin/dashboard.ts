import { createServerClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { OrderStatus, OrderType } from '@/lib/types/order'

export type RecentOrder = {
  id: string
  orderNumber: string
  orderType: OrderType
  status: OrderStatus
  totalAmount: number
  createdAt: string
  customerName: string | null
  customerPhone: string | null
}

export type OrdersByType = {
  type: OrderType
  count: number
  percentage: number
}

export type OrdersByStatus = {
  status: OrderStatus
  count: number
}

export type DashboardStats = {
  totalOrders: number
  pendingOrders: number
  activeOrders: number
  completedToday: number
  cancelledOrders: number
  pendingQuotes: number
  sentQuotes: number
  totalCustomers: number
  totalTechnicians: number
  totalAvailableProducts: number
  newOrdersToday: number
  totalRevenue: number
  recentOrders: RecentOrder[]
  ordersByType: OrdersByType[]
  ordersByStatus: OrdersByStatus[]
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const supabase = await createServerClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    totalOrdersRes,
    pendingOrdersRes,
    activeOrdersRes,
    completedTodayRes,
    cancelledOrdersRes,
    pendingQuotesRes,
    sentQuotesRes,
    totalCustomersRes,
    totalTechniciansRes,
    totalProductsRes,
    newOrdersTodayRes,
    revenueRes,
    recentOrdersRes,
    ordersByTypeRes,
    ordersByStatusRes,
  ] = await Promise.all([
    // إجمالي الطلبات
    supabase.from('orders').select('*', { count: 'exact', head: true }),

    // الطلبات المعلقة
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

    // الطلبات النشطة
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .in('status', ['confirmed', 'assigned', 'on_the_way', 'in_progress']),

    // المكتملة اليوم
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),

    // الملغية
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),

    // عروض بانتظار الرد
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('quote_status', 'pending'),

    // عروض مرسلة
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('quote_status', 'sent'),

    // إجمالي العملاء
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),

    // إجمالي الفنيين
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'technician'),

    // المنتجات المتاحة
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_available', true),

    // طلبات اليوم
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),

    // الإيرادات الإجمالية
    supabase.from('orders').select('total_amount').eq('status', 'completed'),

    // آخر 5 طلبات
    supabase.from('orders')
      .select('id, order_number, order_type, status, total_amount, created_at, customer_id, profiles(full_name, phone)')
      .order('created_at', { ascending: false })
      .limit(5),

    // توزيع حسب النوع
    supabase.from('orders').select('order_type'),

    // توزيع حسب الحالة
    supabase.from('orders').select('status'),
  ])

  // حساب الإيرادات
  const totalRevenue = (revenueRes.data ?? []).reduce(
    (sum, row) => sum + (row.total_amount ?? 0),
    0
  )

  // تجهيز آخر 5 طلبات
  const recentOrders: RecentOrder[] = (recentOrdersRes.data ?? []).map((row: any) => ({
    id: row.id,
    orderNumber: row.order_number,
    orderType: row.order_type as OrderType,
    status: row.status as OrderStatus,
    totalAmount: row.total_amount ?? 0,
    createdAt: row.created_at,
    customerName: row.profiles?.full_name ?? null,
    customerPhone: row.profiles?.phone ?? null,
  }))

  // توزيع حسب النوع
  const total = totalOrdersRes.count ?? 0
  const typeCounts: Record<string, number> = {}
  for (const row of ordersByTypeRes.data ?? []) {
    typeCounts[row.order_type] = (typeCounts[row.order_type] ?? 0) + 1
  }
  const ordersByType: OrdersByType[] = Object.entries(typeCounts).map(([type, count]) => ({
    type: type as OrderType,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }))

  // توزيع حسب الحالة
  const statusCounts: Record<string, number> = {}
  for (const row of ordersByStatusRes.data ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1
  }
  const ordersByStatus: OrdersByStatus[] = Object.entries(statusCounts)
    .map(([status, count]) => ({ status: status as OrderStatus, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalOrders: totalOrdersRes.count ?? 0,
    pendingOrders: pendingOrdersRes.count ?? 0,
    activeOrders: activeOrdersRes.count ?? 0,
    completedToday: completedTodayRes.count ?? 0,
    cancelledOrders: cancelledOrdersRes.count ?? 0,
    pendingQuotes: pendingQuotesRes.count ?? 0,
    sentQuotes: sentQuotesRes.count ?? 0,
    totalCustomers: totalCustomersRes.count ?? 0,
    totalTechnicians: totalTechniciansRes.count ?? 0,
    totalAvailableProducts: totalProductsRes.count ?? 0,
    newOrdersToday: newOrdersTodayRes.count ?? 0,
    totalRevenue,
    recentOrders,
    ordersByType,
    ordersByStatus,
  }
})
