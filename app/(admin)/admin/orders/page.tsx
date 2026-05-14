import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminOrders } from '@/lib/data/admin/orders'
import AdminOrdersFilters from '@/components/admin/orders/AdminOrdersFilters'
import AdminOrdersTable from '@/components/admin/orders/AdminOrdersTable'
import AdminOrdersPagination from '@/components/admin/orders/AdminOrdersPagination'
import AdminOrdersRealtimeWrapper from '@/components/admin/orders/AdminOrdersRealtimeWrapper'
import type { OrderStatus, OrderType } from '@/lib/types/order'

export const metadata = { title: 'إدارة الطلبات — تمّ' }

interface PageProps {
  searchParams: Promise<{ status?: string; order_type?: string; search?: string; page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const { orders, totalCount, totalPages } = await getAdminOrders({
    status: (sp.status as OrderStatus) ?? 'all',
    order_type: (sp.order_type as OrderType) ?? 'all',
    search: sp.search,
    page,
    limit: 15,
  })

  return (
    <AdminOrdersRealtimeWrapper>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* رأس الصفحة */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            إدارة الطلبات
          </h1>
          <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9rem' }}>
            إجمالي {totalCount.toLocaleString('ar-SA')} طلب
          </p>
        </div>

        {/* الفلاتر */}
        <Suspense>
          <AdminOrdersFilters />
        </Suspense>

        {/* الجدول */}
        <AdminOrdersTable orders={orders} totalCount={totalCount} />

        {/* Pagination */}
        <Suspense>
          <AdminOrdersPagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        </Suspense>
      </div>
    </AdminOrdersRealtimeWrapper>
  )
}
