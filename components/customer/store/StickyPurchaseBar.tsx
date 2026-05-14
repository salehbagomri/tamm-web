'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types/product'
import { useCart } from '@/lib/store/cart-context'
import { formatPrice } from '@/lib/utils/format'

interface Props {
  product: Product
  isLoggedIn: boolean
}

export default function StickyPurchaseBar({ product, isLoggedIn }: Props) {
  const { addToCart, items } = useCart()
  const [visible, setVisible] = useState(false)
  const [includeInstall, setIncludeInstall] = useState(false)
  const [added, setAdded] = useState(false)

  const isInCart = items.some((i) => i.id === product.id)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 280)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* اسم المنتج والسعر */}
        <div style={{ flex: 1, minWidth: '0' }}>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--text-second)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {product.name}
          </p>
          <p style={{ margin: '0.125rem 0 0', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
            {product.isPriceOnRequest ? '💬 السعر عند الطلب' : formatPrice(totalPrice)}
          </p>
        </div>

        {/* خيار التركيب */}
        {product.requiresInstallation && product.installationPrice > 0 && !product.isPriceOnRequest && !isInCart && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={includeInstall}
              onChange={(e) => setIncludeInstall(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--blue-primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-second)' }}>
              تضمين التركيب{' '}
              <span style={{ color: 'var(--blue-light)', fontWeight: 600 }}>
                (+{formatPrice(product.installationPrice)})
              </span>
            </span>
          </label>
        )}

        {/* زر الإجراء */}
        {product.isPriceOnRequest ? (
          <Link href="/services" style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.9375rem',
            backgroundColor: 'var(--blue-mid)',
            color: '#fff',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            💬 طلب عرض سعر
          </Link>
        ) : isInCart ? (
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <span style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(34,201,138,0.1)',
              border: '1px solid var(--success)',
              color: 'var(--success)',
              fontWeight: 700,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}>
              ✓ في السلة
            </span>
            <Link href="/cart" style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'var(--blue-primary)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}>
              إتمام الشراء ←
            </Link>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              border: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              background: added
                ? 'rgba(34,201,138,0.15)'
                : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
              color: added ? 'var(--success)' : '#fff',
              outline: added ? '1px solid var(--success)' : 'none',
              boxShadow: added ? 'none' : '0 4px 16px rgba(21,118,212,0.3)',
            }}
          >
            {added ? '✓ تمت الإضافة!' : '🛒 إضافة للسلة'}
          </button>
        )}
      </div>
    </div>
  )
}
