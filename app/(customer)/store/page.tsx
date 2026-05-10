import { Suspense } from 'react'
import { getProducts } from '@/lib/data/store'
import StoreFilters from '@/components/customer/store/StoreFilters'
import ProductsGrid from '@/components/customer/store/ProductsGrid'
import StorePagination from '@/components/customer/store/StorePagination'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تمّ | المتجر',
  description: 'تصفح منتجات التكييف والطاقة الشمسية — مكيفات، ألواح شمسية، بطاريات وإكسسوارات',
}

const LIMIT = 12

interface SearchParams {
  category?: string
  sort?: string
  search?: string
  page?: string
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1') || 1)

  const { products, totalCount, totalPages } = await getProducts({
    category: params.category,
    sort: params.sort,
    search: params.search,
    page,
    limit: LIMIT,
  })

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* عنوان الصفحة */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
          المتجر
        </h1>
        <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
          تصفح منتجات التكييف والطاقة الشمسية
        </p>
      </div>

      {/* المحتوى الرئيسي: فلاتر + منتجات */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* الفلاتر — Suspense لأنها تستخدم useSearchParams */}
        <Suspense fallback={
          <div style={{ width: '220px', flexShrink: 0, height: '400px', borderRadius: '14px' }}
            className="skeleton" />
        }>
          <StoreFilters />
        </Suspense>

        {/* المنتجات */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ProductsGrid
            products={products}
            totalCount={totalCount}
            currentPage={page}
            limit={LIMIT}
          />

          {/* Pagination */}
          <Suspense fallback={null}>
            <StorePagination totalPages={totalPages} currentPage={page} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
