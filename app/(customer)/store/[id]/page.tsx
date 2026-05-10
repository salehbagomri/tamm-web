import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تفاصيل المنتج | تمّ',
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>
        تفاصيل المنتج
      </h1>
      <p style={{ color: 'var(--text-second)', marginTop: '0.5rem' }}>
        معرّف المنتج: {params.id} — قيد التطوير
      </p>
    </div>
  )
}
