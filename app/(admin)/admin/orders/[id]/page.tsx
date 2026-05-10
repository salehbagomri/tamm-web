import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تفاصيل الطلب | تمّ',
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>
        تفاصيل الطلب — إدارة
      </h1>
      <p style={{ color: 'var(--text-second)', marginTop: '0.5rem' }}>
        معرّف الطلب: {params.id} — قيد التطوير
      </p>
    </div>
  )
}
