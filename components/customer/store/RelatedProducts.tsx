import ProductCard from '@/components/customer/ProductCard'
import type { Product } from '@/lib/types/product'

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        منتجات مشابهة
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.25rem',
      }}>
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
