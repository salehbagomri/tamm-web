'use client'

import { useState, useTransition } from 'react'
import { signOutAllDevices } from '@/lib/actions/account-security'

interface SessionInfoCardProps {
  lastSignInAt: string | null
  emailConfirmedAt: string | null
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function SessionInfoCard({ lastSignInAt, emailConfirmedAt }: SessionInfoCardProps) {
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleSignOutAll() {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 5000)
      return
    }
    startTransition(async () => {
      await signOutAllDevices()
    })
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          🛡 الجلسات وإعدادات الدخول
        </h2>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-second)' }}>
          معلومات عن آخر نشاط على حسابك.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-surface2)',
            borderRadius: '10px',
            padding: '0.75rem 0.875rem',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            آخر تسجيل دخول
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            {formatDateTime(lastSignInAt)}
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface2)',
            borderRadius: '10px',
            padding: '0.75rem 0.875rem',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            البريد موثّق منذ
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            {emailConfirmedAt ? formatDateTime(emailConfirmedAt) : 'لم يتم التوثيق بعد'}
          </p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'rgba(245,166,35,0.06)',
          border: '1px solid rgba(245,166,35,0.25)',
          borderRadius: '12px',
          padding: '0.875rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div>
          <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            تسجيل الخروج من كل الأجهزة
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-second)', lineHeight: 1.5 }}>
            ينهي كل جلسات الدخول النشطة (الويب، الموبايل، التطبيق). ستحتاج لتسجيل الدخول مجدداً.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOutAll}
          disabled={pending}
          style={{
            alignSelf: 'flex-start',
            padding: '0.6rem 1.15rem',
            borderRadius: '10px',
            backgroundColor: confirming ? 'var(--warning)' : 'rgba(245,166,35,0.12)',
            border: '1px solid rgba(245,166,35,0.4)',
            color: confirming ? '#fff' : 'var(--warning)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: pending ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          {pending
            ? 'جاري الخروج...'
            : confirming
              ? '⚠️ اضغط مرة أخرى للتأكيد'
              : '🚪 خروج من كل الأجهزة'}
        </button>
      </div>
    </div>
  )
}
