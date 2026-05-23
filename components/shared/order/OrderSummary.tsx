import type { OrderItem } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils/format'
import { computeOrderTotals } from '@/lib/utils/order-pricing'

interface OrderSummaryProps {
  items: OrderItem[]
  deliveryFee?: number
}

export default function OrderSummary({ items, deliveryFee = 0 }: OrderSummaryProps) {
  const totals = computeOrderTotals(items)
  const grandTotal = totals.grandTotal + (deliveryFee ?? 0)

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontSize: '0.9rem',
    padding: '0.4rem 0',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-second)',
  }

  const valueStyle: React.CSSProperties = {
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontVariantNumeric: 'tabular-nums',
  }

  return (
    <div
      style={{
        marginTop: '0.5rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={rowStyle}>
        <span style={labelStyle}>إجمالي المنتجات (صافي)</span>
        <span style={valueStyle}>{formatPrice(totals.productsSubtotal)}</span>
      </div>

      {totals.installationSubtotal > 0 && (
        <div style={rowStyle}>
          <span style={labelStyle}>إجمالي خدمة التركيب</span>
          <span style={{ ...valueStyle, color: 'var(--success)' }}>
            {formatPrice(totals.installationSubtotal)}
          </span>
        </div>
      )}

      <div style={rowStyle}>
        <span style={labelStyle}>الشحن والتوصيل</span>
        <span style={valueStyle}>
          {deliveryFee && deliveryFee > 0 ? formatPrice(deliveryFee) : 'مجاني'}
        </span>
      </div>

      <div
        style={{
          ...rowStyle,
          marginTop: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border)',
          fontSize: '1.05rem',
        }}
      >
        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>الإجمالي الكلي</span>
        <span
          style={{
            fontWeight: 800,
            color: 'var(--blue-light)',
            fontSize: '1.15rem',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatPrice(grandTotal)}
        </span>
      </div>
    </div>
  )
}
