import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminProducts } from '@/lib/data/admin/products'
import AdminProductsFilters from '@/components/admin/products/AdminProductsFilters'
import AdminProductsTable from '@/components/admin/products/AdminProductsTable'
import AdminOrdersPagination from '@/components/admin/orders/AdminOrdersPagination'
import type { ProductCategory } from '@/lib/types/product'

export const metadata = { title: 'إدارة المنتجات — تمّ' }

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const { products, totalCount, totalPages } = await getAdminProducts({
    category: sp.category as ProductCategory | undefined,
    search: sp.search,
    page, limit: 20,
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>إدارة المنتجات</h1>
          <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9rem' }}>إجمالي {totalCount} منتج</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/admin/products/import" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'var(--bg-surface2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            📥 استيراد مخزون
          </Link>
          <Link href="/admin/products/new" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            + إضافة منتج
          </Link>
        </div>
      </div>
      <Suspense><AdminProductsFilters /></Suspense>
      <AdminProductsTable products={products} totalCount={totalCount} />
      <Suspense><AdminOrdersPagination currentPage={page} totalPages={totalPages} totalCount={totalCount} /></Suspense>
    </div>
  )
}
