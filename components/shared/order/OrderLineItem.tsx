import Image from 'next/image'
import type { OrderItem } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils/format'
import { computeLineTotals } from '@/lib/utils/order-pricing'

interface OrderLineItemProps {
  item: OrderItem
  showImage?: boolean
}

export default function OrderLineItem({ item, showImage = false }: OrderLineItemProps) {
  const name = item.product?.name ?? item.service?.name ?? 'عنصر غير معروف'
  const imageUrl = item.product?.image_url ?? item.product?.imageUrl ?? null
  const totals = computeLineTotals(item)

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.875rem',
        padding: '0.875rem 0',
        borderBottom: '1px solid var(--border)',
        alignItems: 'flex-start',
      }}
    >
      {showImage && imageUrl && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '10px',
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: 'var(--bg-surface2)',
            position: 'relative',
          }}
        >
          <Image src={imageUrl} alt={name} fill style={{ objectFit: 'cover' }} sizes="64px" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: '0 0 0.375rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
          }}
        >
          {name}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '0.8125rem',
            color: 'var(--text-second)',
            lineHeight: 1.5,
          }}
        >
          الكمية: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.quantity.toLocaleString('en-SA')}</span>
          {' × '}
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatPrice(item.unitPrice)}</span>
        </p>
        {totals.hasInstallation && (
          <p
            style={{
              margin: '0.375rem 0 0',
              fontSize: '0.8rem',
              color: 'var(--success)',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              flexWrap: 'wrap',
            }}
          >
            <span>🛠</span>
            <span>
              خدمة التركيب:{' '}
              <span style={{ fontWeight: 700 }}>{formatPrice(totals.installationSubtotal)}</span>
              {' '}({formatPrice(item.installationPricePerUnit ?? 0)} × {item.quantity.toLocaleString('en-SA')})
            </span>
          </p>
        )}
      </div>

      <div style={{ textAlign: 'left', flexShrink: 0, minWidth: '100px' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          {formatPrice(totals.lineTotal)}
        </p>
        {totals.hasInstallation && (
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.7rem',
              color: 'var(--text-faint)',
              whiteSpace: 'nowrap',
            }}
          >
            شامل التركيب
          </p>
        )}
      </div>
    </div>
  )
}
