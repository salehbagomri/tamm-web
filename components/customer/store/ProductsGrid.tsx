import ProductCard from '@/components/customer/ProductCard'
import type { Product } from '@/lib/types/product'

interface ProductsGridProps {
  products: Product[]
  totalCount: number
  currentPage: number
  limit: number
}

export default function ProductsGrid({ products, totalCount, currentPage, limit }: ProductsGridProps) {
  const from = (currentPage - 1) * limit + 1
  const to = Math.min(currentPage * limit, totalCount)

  if (products.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '4rem 2rem', textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderRadius: '14px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          لا توجد منتجات
        </h3>
        <p style={{ color: 'var(--text-second)', fontSize: '0.9rem' }}>
          جرّب تغيير الفلتر أو كلمة البحث
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* عدد النتائج */}
      {totalCount > 0 && (
        <p style={{
          fontSize: '0.875rem', color: 'var(--text-second)',
          marginBottom: '1.25rem',
        }}>
          عرض <strong style={{ color: 'var(--text-primary)' }}>{from}–{to}</strong> من{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> منتج
        </p>
      )}

      {/* شبكة المنتجات */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.25rem',
      }}>
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
