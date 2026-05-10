import type { Order } from '@/lib/types/order'
import { ORDER_TYPE_LABELS } from './OrderCard'

export default function OrderDetailCard({ order }: { order: Order }) {
  const date = new Date(order.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  
  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            الطلب {order.orderNumber}
          </h2>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
            {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType} • {date}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* العنوان */}
        {order.address && (
          <div style={{ backgroundColor: 'var(--bg-surface2)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0 0 0.25rem' }}>عنوان التوصيل / الخدمة</p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>{order.address}</p>
          </div>
        )}

        {/* الموعد המفضل */}
        {(order.preferredDate || order.preferredTimeSlot) && (
          <div style={{ backgroundColor: 'var(--bg-surface2)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0 0 0.25rem' }}>الموعد المفضل</p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
              {order.preferredDate} {order.preferredTimeSlot ? `(${order.preferredTimeSlot})` : ''}
            </p>
          </div>
        )}
      </div>

      {/* الملاحظات */}
      {order.notes && (
        <div style={{ backgroundColor: 'rgba(21,118,212,0.05)', border: '1px solid rgba(21,118,212,0.1)', padding: '1rem', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--blue-light)', margin: '0 0 0.25rem', fontWeight: 600 }}>ملاحظاتك</p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>{order.notes}</p>
        </div>
      )}
    </div>
  )
}
