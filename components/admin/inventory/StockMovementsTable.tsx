import Link from 'next/link'
import type { AdminStockMovementRow } from '@/lib/data/admin/stock-movements'
import type { StockMovementType } from '@/lib/types/stock-movement'

const TYPE_META: Record<StockMovementType, { label: string; color: string; bg: string }> = {
  sale: { label: 'بيع', color: '#c0392b', bg: 'rgba(224,82,82,0.12)' },
  cancel_return: { label: 'إرجاع', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  import: { label: 'استيراد', color: '#1576d4', bg: 'rgba(21,118,212,0.12)' },
  manual_adjustment: { label: 'تعديل يدوي', color: '#a16207', bg: 'rgba(245,158,11,0.14)' },
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatChange(n: number): string {
  if (n > 0) return `+${n.toLocaleString('en-SA')}`
  return n.toLocaleString('en-SA')
}

export default function StockMovementsTable({ movements }: { movements: AdminStockMovementRow[] }) {
  if (movements.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '4rem',
        color: 'var(--text-faint)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
      }}>
        لا توجد حركات مخزون تطابق الفلتر
      </div>
    )
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'right', padding: '0.875rem 1rem',
    fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-second)',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = {
    padding: '0.875rem 1rem', fontSize: '0.875rem',
    color: 'var(--text-primary)', borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      overflowX: 'auto',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
        <thead style={{ backgroundColor: 'var(--bg-surface2)' }}>
          <tr>
            <th style={thStyle}>التاريخ</th>
            <th style={thStyle}>المنتج</th>
            <th style={thStyle}>النوع</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>قبل</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>بعد</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>التغيير</th>
            <th style={thStyle}>المسؤول</th>
            <th style={thStyle}>المرجع / الملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => {
            const meta = TYPE_META[m.movementType]
            const changeColor = m.quantityChange > 0
              ? 'var(--success)'
              : m.quantityChange < 0 ? 'var(--error)' : 'var(--text-second)'

            return (
              <tr key={m.id}>
                <td style={{ ...tdStyle, color: 'var(--text-second)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {formatDateTime(m.createdAt)}
                </td>
                <td style={tdStyle}>{m.productName}</td>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '999px',
                    backgroundColor: meta.bg,
                    color: meta.color,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    {meta.label}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace' }}>
                  {m.quantityBefore.toLocaleString('en-SA')}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace' }}>
                  {m.quantityAfter.toLocaleString('en-SA')}
                </td>
                <td style={{
                  ...tdStyle, textAlign: 'center', fontFamily: 'monospace',
                  fontWeight: 700, color: changeColor,
                }}>
                  {formatChange(m.quantityChange)}
                </td>
                <td style={{ ...tdStyle, color: 'var(--text-second)', fontSize: '0.825rem' }}>
                  {m.performedByName ?? <span style={{ color: 'var(--text-faint)' }}>النظام</span>}
                </td>
                <td style={{ ...tdStyle, color: 'var(--text-second)', fontSize: '0.825rem' }}>
                  {m.orderId && m.orderNumber ? (
                    <Link
                      href={`/admin/orders/${m.orderId}`}
                      style={{ color: 'var(--blue-light)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      #{m.orderNumber}
                    </Link>
                  ) : m.notes ? (
                    <span>{m.notes}</span>
                  ) : (
                    <span style={{ color: 'var(--text-faint)' }}>—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
