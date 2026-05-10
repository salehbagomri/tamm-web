import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إنشاء حساب | تمّ',
  description: 'أنشئ حسابك للانضمام إلى منصة تمّ لخدمات التكييف والطاقة الشمسية',
}

// صفحة إنشاء الحساب — Placeholder للمرحلة الأولى
export default function RegisterPage() {
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
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        إنشاء حساب جديد
      </h1>

      <p style={{ color: 'var(--text-second)', fontSize: '0.875rem' }}>
        صفحة إنشاء الحساب — قيد التطوير
      </p>
    </div>
  )
}
