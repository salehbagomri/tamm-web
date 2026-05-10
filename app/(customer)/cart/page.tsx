'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/store/cart-context'
import CartItemRow from '@/components/customer/cart/CartItemRow'

export default function CartPage() {
  const { items, totalAmount } = useCart()
  const router = useRouter()

  const installTotal = items.reduce((sum, i) =>
    sum + (i.includeInstallation ? i.installationPrice * i.quantity : 0), 0)
  const productTotal = totalAmount - installTotal

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-second)', fontSize: '0.9rem' }}>المنتجات</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{productTotal.toLocaleString('ar-SA')} ر.س</span>
            </div>
            {installTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-second)', fontSize: '0.9rem' }}>التركيب</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{installTotal.toLocaleString('ar-SA')} ر.س</span>
              </div>
            )}
            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.0625rem' }}>الإجمالي</span>
              <span style={{ color: 'var(--blue-light)', fontWeight: 700, fontSize: '1.25rem' }}>{totalAmount.toLocaleString('ar-SA')} ر.س</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 24px rgba(21,118,212,0.3)',
            }}>
            إتمام الطلب ←
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '0.75rem' }}>
            🔒 تسجيل الدخول مطلوب لإتمام الطلب
          </p>
        </div>
      </div>
    </div>
  )
}
