import Link from 'next/link'
import type { Order } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils/format'

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'معلق', color: 'var(--warning)', bg: 'rgba(245,166,35,0.1)' },
  confirmed: { label: 'مؤكد', color: 'var(--blue-primary)', bg: 'rgba(21,118,212,0.1)' },
  assigned: { label: 'تم التعيين', color: 'var(--blue-primary)', bg: 'rgba(21,118,212,0.1)' },
  on_the_way: { label: 'الفني في الطريق', color: 'var(--blue-light)', bg: 'rgba(141,203,250,0.1)' },
  in_progress: { label: 'جاري التنفيذ', color: 'var(--blue-light)', bg: 'rgba(141,203,250,0.1)' },
  completed: { label: 'مكتمل', color: 'var(--success)', bg: 'rgba(34,201,138,0.1)' },
  cancelled: { label: 'ملغي', color: 'var(--error)', bg: 'rgba(224,82,82,0.1)' },
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  product: '🛒 منتجات',
  service: '🔧 خدمة',
  product_and_service: '🛒 + 🔧 منتجات مع تركيب',
  quote_request: '💬 طلب عرض سعر',
}

export default function OrderCard({ order }: { order: Order }) {
  const statusDef = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'var(--text-second)', bg: 'var(--bg-surface2)' }
  const date = new Date(order.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  const isActive = ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress'].includes(order.status)
  
  // Progress (1 to 5)
  const steps = ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress', 'completed']
  const currentStep = steps.indexOf(order.status) + 1

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {order.orderNumber}
            </h3>
            <span style={{
              padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: statusDef.bg, color: statusDef.color,
            }}>
              {statusDef.label}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-second)', margin: 0 }}>
            {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType} • {date}
          </p>
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--blue-light)', margin: 0 }}>
            {order.totalAmount > 0 ? formatPrice(order.totalAmount) : '—'}
          </p>
        </div>
      </div>

      {/* Progress Bar (Visual) */}
      {isActive && order.orderType !== 'quote_request' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0.5rem 0' }}>
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} style={{
              flex: 1, height: '6px', borderRadius: '3px',
              backgroundColor: currentStep >= step ? 'var(--blue-primary)' : 'var(--bg-surface2)',
              opacity: currentStep === step ? 1 : currentStep > step ? 0.6 : 1,
            }} />
          ))}
        </div>
      )}

      {/* Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Link href={`/orders/${order.id}`} style={{
          padding: '0.625rem 1.5rem', borderRadius: '10px',
          backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
        }}>
          عرض التفاصيل ←
        </Link>
      </div>
    </div>
  )
}
