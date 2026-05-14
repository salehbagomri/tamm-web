import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types/product'
import { formatPrice } from '@/lib/utils/format'

const CATEGORY_LABELS: Record<string, string> = {
  ac: 'مكيف', solar_panel: 'لوح شمسي', solar_battery: 'بطارية',
  solar_inverter: 'إنفرتر', accessory: 'إكسسوار',
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.oldPrice && product.price && product.price < product.oldPrice
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price! / product.oldPrice!) * 100)
    : null

  return (
    <Link
      href={`/store/${product.id}`}
      className="product-card"
      style={{
        display: 'flex', flexDirection: 'column',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px', overflow: 'hidden',
        textDecoration: 'none', cursor: 'pointer',
      }}
    >
      {/* صورة المنتج */}
      <div style={{
        position: 'relative', aspectRatio: '4/3',
        backgroundColor: 'var(--bg-surface2)',
        overflow: 'hidden',
      }}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-faint)',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
        {/* شارة الخصم */}
        {discountPercent && (
          <div style={{
            position: 'absolute', top: '0.625rem',
            right: '0.625rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: 'var(--error)', color: '#fff',
            borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
          }}>
            -{discountPercent}%
          </div>
        )}
        {/* شارة الفئة */}
        <div style={{
          position: 'absolute', bottom: '0.625rem', right: '0.625rem',
          padding: '0.2rem 0.5rem',
          backgroundColor: 'rgba(13,24,37,0.85)',
          border: '1px solid var(--border)',
          borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-second)',
        }}>
          {CATEGORY_LABELS[product.category] ?? product.category}
        </div>
      </div>

      {/* تفاصيل المنتج */}
      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <p style={{
          fontSize: '0.875rem', fontWeight: 600,
          color: 'var(--text-primary)', margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </p>
        {product.brand && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0 }}>
            {product.brand}
          </p>
        )}

        {/* السعر */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          {product.isPriceOnRequest ? (
            <span style={{ fontSize: '0.8125rem', color: 'var(--blue-light)', fontWeight: 600 }}>
              السعر عند الطلب
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', textDecoration: 'line-through' }}>
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
