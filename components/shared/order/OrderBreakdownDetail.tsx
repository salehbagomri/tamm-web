import type { OrderItem } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils/format'
import { computeOrderTotals } from '@/lib/utils/order-pricing'

interface OrderBreakdownDetailProps {
  items: OrderItem[]
}

// بلوك تفصيلي للمدير/الفني — شفافية مالية كاملة (لا يُعرض للعميل).
export default function OrderBreakdownDetail({ items }: OrderBreakdownDetailProps) {
  const totals = computeOrderTotals(items)

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontSize: '0.85rem',
    padding: '0.35rem 0',
  }

  return (
    <div
      style={{
        marginTop: '1rem',
        backgroundColor: 'var(--bg-surface2)',
        borderRadius: '12px',
        padding: '1rem 1.125rem',
        border: '1px dashed var(--border)',
      }}
    >
      <h4
        style={{
          margin: '0 0 0.625rem',
          fontSize: '0.825rem',
          fontWeight: 700,
          color: 'var(--text-second)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        <span>🔍</span>
        <span>تفصيل المبلغ</span>
      </h4>

      <div style={rowStyle}>
        <span style={{ color: 'var(--text-second)' }}>صافي السلع</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {formatPrice(totals.productsSubtotal)}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={{ color: 'var(--text-second)' }}>أجور التركيب</span>
        <span style={{ fontWeight: 700, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
          {formatPrice(totals.installationSubtotal)}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={{ color: 'var(--text-second)' }}>عدد العناصر</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {totals.itemsCount.toLocaleString('en-SA')}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={{ color: 'var(--text-second)' }}>عناصر تشمل التركيب</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {totals.installationItemsCount.toLocaleString('en-SA')}
        </span>
      </div>
    </div>
  )
}
