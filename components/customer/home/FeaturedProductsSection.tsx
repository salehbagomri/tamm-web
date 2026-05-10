import Link from 'next/link'
import ProductCard from '@/components/customer/ProductCard'
import type { Product } from '@/lib/types/product'

export default function FeaturedProductsSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section style={{ padding: '3rem 1.5rem', backgroundColor: 'var(--bg-surface2)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* رأس القسم */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            منتجات مميزة ⭐
          </h2>
          <Link href="/store" style={{
            color: 'var(--blue-light)', fontSize: '0.9rem', fontWeight: 600,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            عرض الكل ←
          </Link>
        </div>

        {/* شبكة المنتجات */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
