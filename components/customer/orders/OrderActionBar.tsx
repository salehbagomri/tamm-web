'use client'

import { useRouter } from 'next/navigation'

export default function OrderActionBar({ status }: { status: string }) {
  const router = useRouter()
  const isCompleted = status === 'completed'
  const isCancelled = status === 'cancelled'

  const btnBase: React.CSSProperties = {
    flex: 1, padding: '0.875rem', borderRadius: '12px',
    fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
    fontFamily: 'inherit', border: 'none', transition: 'opacity 0.15s',
  }

  return (
    <>
      {/* Spacer so page content isn't hidden behind the bar */}
      <div style={{ height: '88px' }} />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '1rem 1.5rem',
        display: 'flex', gap: '0.75rem',
      }}>
        {isCancelled ? (
          <button
            onClick={() => router.push('/store')}
            style={{ ...btnBase, background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))', color: '#fff' }}
          >
            تسوق الآن
          </button>
        ) : (
          <>
            <button
              onClick={() => router.push(isCompleted ? '/store' : '/orders')}
              style={{
                ...btnBase,
                backgroundColor: 'var(--bg-surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text-second)',
              }}
            >
              {isCompleted ? 'طلب مرة أخرى' : 'طلباتي'}
            </button>
            <button
              onClick={() => router.push('/store')}
              style={{ ...btnBase, background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))', color: '#fff' }}
            >
              مواصلة التسوق
            </button>
          </>
        )}
      </div>
    </>
  )
}
