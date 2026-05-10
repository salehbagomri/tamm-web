'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types/product'
import { useCart } from '@/lib/store/cart-context'
import Badge from '@/components/ui/Badge'

const CATEGORY_LABELS: Record<string, string> = {
  ac: 'مكيف', solar_panel: 'لوح شمسي', solar_battery: 'بطارية',
  solar_inverter: 'إنفرتر', accessory: 'إكسسوار',
}

interface ProductInfoProps {
  product: Product
  isLoggedIn: boolean
}

export default function ProductInfo({ product, isLoggedIn }: ProductInfoProps) {
  const { addToCart, items } = useCart()
  const [includeInstall, setIncludeInstall] = useState(false)
  const [added, setAdded] = useState(false)

  const isInCart = items.some((i) => i.id === product.id)

  const hasDiscount = product.oldPrice && product.price && product.price < product.oldPrice
  const discountPct = hasDiscount ? Math.round((1 - product.price! / product.oldPrice!) * 100) : null

  function handleAddToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      installationPrice: product.installationPrice,
      includeInstallation: includeInstall,
      isPriceOnRequest: product.isPriceOnRequest,
      requiresInstallation: product.requiresInstallation,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const totalPrice = product.price
    ? product.price + (includeInstall ? product.installationPrice : 0)
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* الفئة */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8125rem',
          backgroundColor: 'rgba(21,118,212,0.12)', color: 'var(--blue-light)',
          border: '1px solid rgba(21,118,212,0.2)',
        }}>
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
        {product.isFeatured && (
          <span style={{
            padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8125rem',
            backgroundColor: 'rgba(245,166,35,0.12)', color: 'var(--warning)',
            border: '1px solid rgba(245,166,35,0.2)',
          }}>
            ⭐ مميز
          </span>
        )}
      </div>

      {/* الاسم */}
      <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
        {product.name}
      </h1>

      {/* العلامة التجارية */}
      {product.brand && (
        <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
          العلامة التجارية: <strong style={{ color: 'var(--text-primary)' }}>{product.brand}</strong>
        </p>
      )}

      {/* السعر */}
      <div style={{
        padding: '1.25rem', backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderRadius: '14px',
      }}>
        {product.isPriceOnRequest ? (
          <div style={{ color: 'var(--blue-light)', fontSize: '1.125rem', fontWeight: 700 }}>
            💬 السعر عند الطلب
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {totalPrice?.toLocaleString('ar-SA')} ر.س
              </span>
              {product.oldPrice && (
                <span style={{ fontSize: '1rem', color: 'var(--text-faint)', textDecoration: 'line-through' }}>
                  {product.oldPrice.toLocaleString('ar-SA')}
                </span>
              )}
              {discountPct && (
                <span style={{
                  padding: '0.2rem 0.5rem', borderRadius: '6px',
                  backgroundColor: 'var(--error)', color: '#fff',
                  fontSize: '0.8rem', fontWeight: 700,
                }}>
                  -{discountPct}%
                </span>
              )}
            </div>
            {includeInstall && product.installationPrice > 0 && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0.25rem 0 0' }}>
                يشمل: السعر الأساسي ({product.price?.toLocaleString('ar-SA')} ر.س) + التركيب ({product.installationPrice.toLocaleString('ar-SA')} ر.س)
              </p>
            )}
          </>
        )}
      </div>

      {/* الوصف */}
      {product.description && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            الوصف
          </h2>
          <p style={{ color: 'var(--text-second)', lineHeight: 1.8, margin: 0, fontSize: '0.9375rem' }}>
            {product.description}
          </p>
        </div>
      )}

      {/* المواصفات */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            المواصفات
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.entries(product.specs).map(([key, val]) => (
                <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-second)', fontSize: '0.875rem', width: '40%' }}>
                    {key}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                    {String(val)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* خيار التركيب */}
      {product.requiresInstallation && product.installationPrice > 0 && !product.isPriceOnRequest && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeInstall}
            onChange={(e) => setIncludeInstall(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--blue-primary)', cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
            تضمين التركيب{' '}
            <span style={{ color: 'var(--blue-light)', fontWeight: 600 }}>
              (+{product.installationPrice.toLocaleString('ar-SA')} ر.س)
            </span>
          </span>
        </label>
      )}

      {/* زر الإجراء */}
      {product.isPriceOnRequest ? (
        <Link href="/services" style={{
          display: 'block', textAlign: 'center', padding: '0.875rem 2rem',
          borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
          backgroundColor: 'var(--blue-mid)', color: '#fff', textDecoration: 'none',
          border: '1px solid var(--blue-primary)',
        }}>
          💬 طلب عرض سعر
        </Link>
      ) : isInCart ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{
            flex: 1, padding: '0.875rem', borderRadius: '12px',
            backgroundColor: 'rgba(34,201,138,0.1)', border: '1px solid var(--success)',
            color: 'var(--success)', textAlign: 'center', fontWeight: 700,
          }}>
            ✓ تمت الإضافة للسلة
          </span>
          <Link href="/cart" style={{
            padding: '0.875rem 1.5rem', borderRadius: '12px',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600,
          }}>
            عرض السلة
          </Link>
        </div>
      ) : (
        <button onClick={handleAddToCart} style={{
          padding: '0.875rem 2rem', borderRadius: '12px', fontWeight: 700,
          fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
          background: added
            ? 'rgba(34,201,138,0.15)'
            : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
          color: added ? 'var(--success)' : '#fff',
          border: added ? '1px solid var(--success)' : 'none',
          boxShadow: added ? 'none' : '0 8px 24px rgba(21,118,212,0.3)',
          transition: 'all 0.2s',
        }}>
          {added ? '✓ تمت الإضافة!' : '🛒 إضافة للسلة'}
        </button>
      )}
    </div>
  )
}
