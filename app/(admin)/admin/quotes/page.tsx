import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminQuotes } from '@/lib/data/admin/orders'
import QuotesFilters from '@/components/admin/quotes/QuotesFilters'
import QuotesTable from '@/components/admin/quotes/QuotesTable'
import AdminOrdersPagination from '@/components/admin/orders/AdminOrdersPagination'

export const metadata = { title: 'عروض الأسعار — تمّ' }

interface PageProps {
  searchParams: Promise<{ quote_status?: string; page?: string }>
}

export default async function AdminQuotesPage({ searchParams }: PageProps) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  const { orders, totalCount, totalPages } = await getAdminQuotes({
    quote_status: sp.quote_status ?? 'all',
    page,
    limit: 15,
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
          عروض الأسعار
        </h1>
        <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9rem' }}>
          إجمالي {totalCount} عرض
        </p>
      </div>

      <Suspense>
        <QuotesFilters />
      </Suspense>

      <QuotesTable orders={orders} totalCount={totalCount} />

      <Suspense>
        <AdminOrdersPagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </Suspense>
    </div>
  )
}
