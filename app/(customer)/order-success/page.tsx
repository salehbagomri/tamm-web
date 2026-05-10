import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'تم تأكيد الطلب | تمّ' }

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order } = await searchParams

  return (
    <div style={{ maxWidth: '560px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      {/* أيقونة النجاح */}
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1.5rem',
        background: 'linear-gradient(135deg, var(--success), rgba(34,201,138,0.6))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(34,201,138,0.3)',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        تم تأكيد طلبك! 🎉
      </h1>

      {order && (
        <div style={{
          display: 'inline-block', padding: '0.5rem 1.5rem',
          backgroundColor: 'rgba(21,118,212,0.1)',
          border: '1px solid rgba(21,118,212,0.3)', borderRadius: '999px',
          margin: '0.75rem 0 1.5rem',
        }}>
          <span style={{ color: 'var(--text-second)', fontSize: '0.875rem' }}>رقم الطلب: </span>
          <span style={{ color: 'var(--blue-light)', fontWeight: 700, fontSize: '1rem' }}>{order}</span>
        </div>
      )}

      <p style={{
        color: 'var(--text-second)', lineHeight: 1.8, fontSize: '0.9375rem',
        marginBottom: '2.5rem',
      }}>
        تم استلام طلبك بنجاح. سنتواصل معك قريباً لتأكيد الموعد وترتيب التسليم.
        يمكنك متابعة حالة طلبك من صفحة الطلبات.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/orders" style={{
          padding: '0.875rem 2rem', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
          color: '#fff', fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(21,118,212,0.3)',
        }}>
          📦 تتبع طلبي
        </Link>
        <Link href="/home" style={{
          padding: '0.875rem 2rem', borderRadius: '12px',
          backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none',
        }}>
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
