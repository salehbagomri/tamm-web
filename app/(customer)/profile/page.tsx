import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'حسابي | تمّ',
}

export default function ProfilePage() {
  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>
        حسابي
      </h1>
      <p style={{ color: 'var(--text-second)', marginTop: '0.5rem' }}>
        قيد التطوير — المرحلة القادمة
      </p>
    </div>
  )
}
