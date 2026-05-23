import type { Order } from '@/lib/types/order'
import OrderLineItem from '@/components/shared/order/OrderLineItem'
import OrderSummary from '@/components/shared/order/OrderSummary'

export default function OrderItemsList({ order }: { order: Order }) {
  if (!order.items || order.items.length === 0) return null

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.5rem',
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: '0 0 1rem',
      }}>
        تفاصيل الطلب
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {order.items.map((item) => (
          <OrderLineItem key={item.id} item={item} />
        ))}
      </div>

      <OrderSummary items={order.items} />
    </div>
  )
}
