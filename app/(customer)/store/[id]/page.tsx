import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductById, getRelatedProducts } from '@/lib/data/store'
import { createServerClient } from '@/lib/supabase/server'
import ProductGallery from '@/components/customer/store/ProductGallery'
import ProductInfo from '@/components/customer/store/ProductInfo'
import RelatedProducts from '@/components/customer/store/RelatedProducts'
import StickyPurchaseBar from '@/components/customer/store/StickyPurchaseBar'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'منتج غير موجود | تمّ' }
  return {
    title: `${product.name} | تمّ`,
    description: product.description ?? `تسوّق ${product.name} من متجر تمّ للتكييف والطاقة الشمسية`,
    openGraph: {
      title: product.name,
      description: product.description ?? '',
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const [product, supabase] = await Promise.all([
    getProductById(id),
    createServerClient(),
  ])

  if (!product) notFound()

  // هل المستخدم مسجّل؟
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const related = await getRelatedProducts(product.category, product.id)

  const CATEGORY_LABELS: Record<string, string> = {
    ac: 'مكيفات', solar_panel: 'ألواح شمسية', solar_battery: 'بطاريات',
    solar_inverter: 'إنفرتر', accessory: 'إكسسوارات',
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem', paddingBottom: '5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'الرئيسية', href: '/home' },
          { label: 'المتجر', href: '/store' },
          { label: CATEGORY_LABELS[product.category] ?? product.category, href: `/store?category=${product.category}` },
        ].map((crumb, i) => (
          <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {i > 0 && <span style={{ color: 'var(--text-faint)' }}>←</span>}
            <Link href={crumb.href} style={{ color: 'var(--text-second)', fontSize: '0.875rem', textDecoration: 'none' }}>
              {crumb.label}
            </Link>
          </span>
        ))}
        <span style={{ color: 'var(--text-faint)' }}>←</span>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </span>
      </nav>

      {/* التفاصيل الرئيسية */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        <ProductGallery
          imageUrl={product.imageUrl}
          productName={product.name}
          images={product.images}
          isFeatured={product.isFeatured}
          oldPrice={product.oldPrice}
          price={product.price}
          category={product.category}
        />
        <ProductInfo product={product} isLoggedIn={isLoggedIn} />
      </div>

      {/* المنتجات المشابهة */}
      <RelatedProducts products={related} />
      <StickyPurchaseBar product={product} isLoggedIn={isLoggedIn} />
    </div>
  )
}
