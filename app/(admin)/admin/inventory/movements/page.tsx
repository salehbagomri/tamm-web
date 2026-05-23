import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminStockMovements } from '@/lib/data/admin/stock-movements'
import StockMovementsFilters from '@/components/admin/inventory/StockMovementsFilters'
import StockMovementsTable from '@/components/admin/inventory/StockMovementsTable'
import AdminOrdersPagination from '@/components/admin/orders/AdminOrdersPagination'
import type { StockMovementType } from '@/lib/types/stock-movement'

export const metadata = { title: 'سجل حركات المخزون — تمّ' }

interface PageProps {
  searchParams: Promise<{
    type?: string
    search?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }>
}

export default async function StockMovementsPage({ searchParams }: PageProps) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const { movements, totalCount, totalPages } = await getAdminStockMovements({
    movementType: sp.type as StockMovementType | 'all' | undefined,
    productSearch: sp.search,
    dateFrom: sp.dateFrom,
    dateTo: sp.dateTo,
    page,
    limit: 20,
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
          سجل حركات المخزون
        </h1>
        <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9rem' }}>
          إجمالي {totalCount.toLocaleString('en-SA')} حركة
        </p>
      </div>
      <Suspense><StockMovementsFilters /></Suspense>
      <StockMovementsTable movements={movements} />
      <Suspense>
        <AdminOrdersPagination currentPage={page} totalPages={totalPages} totalCount={totalCount} />
      </Suspense>
    </div>
  )
}
