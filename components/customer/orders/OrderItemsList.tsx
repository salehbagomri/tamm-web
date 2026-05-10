import type { Order } from '@/lib/types/order'

export default function OrderItemsList({ order }: { order: Order }) {
  if (!order.items || order.items.length === 0) return null

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>
        تفاصيل الطلب
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {order.items.map((item) => {
          const name = item.product?.name ?? item.service?.name ?? 'عنصر غير معروف'
          
          return (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                  {name}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-second)', margin: 0 }}>
                  الكمية: {item.quantity} {item.includeInstallation ? '• شامل التركيب' : ''}
                </p>
              </div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {item.unitPrice > 0 ? `${(item.unitPrice * item.quantity).toLocaleString('ar-SA')} ر.س` : '—'}
              </p>
            </div>
          )
        })}

        {/* الإجمالي */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>الإجمالي الكلي</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--blue-light)' }}>
            {order.totalAmount > 0 ? `${order.totalAmount.toLocaleString('ar-SA')} ر.س` : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
