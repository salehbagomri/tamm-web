'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/store/cart-context'
import CartItemRow from '@/components/customer/cart/CartItemRow'
import { formatPrice } from '@/lib/utils/format'
import { validateCartStock } from '@/lib/actions/orders'

export default function CartPage() {
  const { items, totalAmount } = useCart()
  const router = useRouter()
  const [stockError, setStockError] = useState('')
  const [checking, setChecking] = useState(false)

  const installTotal = items.reduce((sum, i) =>
    sum + (i.includeInstallation ? i.installationPrice * i.quantity : 0), 0)
  const productTotal = totalAmount - installTotal

  async function handleCheckout() {
    setStockError('')
    setChecking(true)
    const cartData = items.map(item => ({ id: item.id, quantity: item.quantity, name: item.name }))
    const result = await validateCartStock(cartData)
    setChecking(false)
    if (result.error) {
      setStockError(result.error)
    } else {
      router.push('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem', color: 'var(--text-faint)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          سلتك فارغة
        </h1>
        <p style={{ color: 'var(--text-second)', marginBottom: '2rem' }}>
          لم تضف أي منتجات بعد. تصفح المتجر وابدأ التسوق!
        </p>
        <Link href="/store" style={{
          display: 'inline-block', padding: '0.875rem 2.5rem', borderRadius: '12px',
          backgroundColor: 'var(--blue-primary)', color: '#fff',
          fontWeight: 700, textDecoration: 'none',
        }}>
          تصفح المتجر
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.75rem' }}>
        سلة المشتريات ({items.length})
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* قائمة المنتجات */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {items.map((item) => <CartItemRow key={item.id} item={item} />)}

          <Link href="/store" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            color: 'var(--blue-light)', fontSize: '0.9rem', textDecoration: 'none',
            marginTop: '0.5rem',
          }}>
            ← متابعة التسوق
          </Link>
        </div>

        {/* ملخص الطلب */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: '16px',
          padding: '1.5rem', position: 'sticky', top: '80px',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            ملخص الطلب
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-second)', fontSize: '0.9rem' }}>إجمالي المنتجات (صافي)</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {formatPrice(productTotal)}
              </span>
            </div>
            {installTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-second)', fontSize: '0.9rem' }}>إجمالي خدمة التركيب</span>
                <span style={{ color: 'var(--success)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(installTotal)}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-second)', fontSize: '0.9rem' }}>الشحن والتوصيل</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>مجاني</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.0625rem' }}>الإجمالي الكلي</span>
              <span style={{ color: 'var(--blue-light)', fontWeight: 800, fontSize: '1.25rem', fontVariantNumeric: 'tabular-nums' }}>
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {stockError && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center' }}>
              ⚠️ {stockError}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checking}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '12px',
              background: checking ? 'var(--bg-surface2)' : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              border: 'none', cursor: checking ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              boxShadow: checking ? 'none' : '0 8px 24px rgba(21,118,212,0.3)',
              opacity: checking ? 0.7 : 1,
            }}>
            {checking ? 'جاري التحقق من التوفر...' : 'إتمام الطلب ←'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '0.75rem' }}>
            🔒 تسجيل الدخول مطلوب لإتمام الطلب
          </p>
        </div>
      </div>
    </div>
  )
}
