import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'عروض الأسعار | تمّ',
}

export default function AdminQuotesPage() {
  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>
        عروض الأسعار
      </h1>
      <p style={{ color: 'var(--text-second)', marginTop: '0.5rem' }}>
        قيد التطوير — المرحلة القادمة
      </p>
    </div>
  )
}
