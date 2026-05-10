import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تسجيل الدخول | تمّ',
  description: 'سجّل دخولك للوصول إلى خدمات تمّ للتكييف والطاقة الشمسية',
}

// صفحة تسجيل الدخول — Placeholder للمرحلة الأولى
export default function LoginPage() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '2.5rem',
        textAlign: 'center',
      }}
    >
      {/* شعار تمّ */}
      <div
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'var(--blue-primary)',
          borderRadius: '16px',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}
      >
        تمّ
      </div>

      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        مرحباً بك في تمّ
      </h1>

      <p
        style={{
          color: 'var(--text-second)',
          fontSize: '0.95rem',
          marginBottom: '2rem',
        }}
      >
        صفحة تسجيل الدخول — قيد التطوير
      </p>

      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-surface2)',
          border: '1px solid var(--blue-mid)',
          borderRadius: '10px',
          color: 'var(--blue-light)',
          fontSize: '0.875rem',
        }}
      >
        سيتم تطوير هذه الصفحة في المرحلة الثانية
      </div>
    </div>
  )
}
