import {
  getRevenueReport,
  getCOGSReport,
  getCommissionsReport,
  getTopProducts,
  getTopServices,
  getTechnicianPerformance,
  getOrdersBreakdown,
  getInventoryReport,
} from '@/lib/data/admin/reports'
import ReportsDashboard from '@/components/admin/reports/ReportsDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'التقارير المالية | تمّ',
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const params = await searchParams
  const period = params.period ?? '30'

  // حساب الفترة الزمنية
  const now = new Date()
  const daysBack = parseInt(period) || 30
  const from = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString()
  const to = now.toISOString()

  // فترة المقارنة (نفس المدة السابقة)
  const prevFrom = new Date(now.getTime() - daysBack * 2 * 24 * 60 * 60 * 1000).toISOString()
  const prevTo = from

  // جلب كل البيانات بالتوازي
  const [
    revenue,
    prevRevenue,
    cogs,
    commissions,
    topProducts,
    topServices,
    techPerformance,
    ordersBreakdown,
    inventory,
  ] = await Promise.all([
    getRevenueReport(from, to),
    getRevenueReport(prevFrom, prevTo),
    getCOGSReport(from, to),
    getCommissionsReport(from, to),
    getTopProducts(from, to, 5),
    getTopServices(from, to, 5),
    getTechnicianPerformance(from, to),
    getOrdersBreakdown(from, to),
    getInventoryReport(),
  ])

  const grossProfit = revenue.totalRevenue - cogs.totalCOGS
  const netProfit = grossProfit - commissions.totalCommissions
  const profitMargin = revenue.totalRevenue > 0 ? (netProfit / revenue.totalRevenue) * 100 : 0

  const revenueChange = prevRevenue.totalRevenue > 0
    ? ((revenue.totalRevenue - prevRevenue.totalRevenue) / prevRevenue.totalRevenue) * 100
    : 0

  return (
    <ReportsDashboard
      period={period}
      revenue={revenue}
      cogs={cogs}
      commissions={commissions}
      grossProfit={grossProfit}
      netProfit={netProfit}
      profitMargin={profitMargin}
      revenueChange={revenueChange}
      topProducts={topProducts}
      topServices={topServices}
      techPerformance={techPerformance}
      ordersBreakdown={ordersBreakdown}
      inventory={inventory}
    />
  )
}
