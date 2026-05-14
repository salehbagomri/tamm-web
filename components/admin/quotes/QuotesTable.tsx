import Link from 'next/link'
import type { AdminOrderRow } from '@/lib/data/admin/orders'
import { formatPrice } from '@/lib/utils/format'

const quoteStatusLabels: Record<string, string> = {
  pending: 'بانتظار الإرسال', sent: 'مرسل', accepted: 'مقبول', rejected: 'مرفوض',
}
const quoteStatusColors: Record<string, { bg: string; text: string }> = {
  pending:  { bg: 'rgba(245,166,35,0.12)',  text: 'var(--warning)' },
  sent:     { bg: 'rgba(62,158,245,0.12)',  text: 'var(--blue-light)' },
  accepted: { bg: 'rgba(34,201,138,0.12)', text: 'var(--success)' },
  rejected: { bg: 'rgba(224,82,82,0.12)',  text: 'var(--error)' },
}

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: bg, color: text, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

export default function QuotesTable({ orders, totalCount }: { orders: AdminOrderRow[], totalCount: number }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
        لا توجد عروض أسعار تطابق الفلتر
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>عروض الأسعار</span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>إجمالي: {totalCount}</span>
      </div>

      {/* Desktop */}
      <div className="q-desk">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface2)' }}>
              {['رقم الطلب', 'العميل', 'حالة العرض', 'السعر المقترح', 'تاريخ الإرسال', 'تاريخ الرد', ''].map((h) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const qs = o.quoteStatus ?? 'pending'
              const qc = quoteStatusColors[qs] ?? quoteStatusColors.pending
              return (
                <tr key={o.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--blue-light)', fontSize: '0.875rem' }}>#{o.orderNumber}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{o.customerName ?? '—'}</p>
                    {o.customerPhone && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-faint)' }}>{o.customerPhone}</p>}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Badge label={quoteStatusLabels[qs] ?? qs} bg={qc.bg} text={qc.text} />
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {o.quotePrice ? formatPrice(o.quotePrice) : '—'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar-SA') : '—'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>—</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Link href={`/admin/orders/${o.id}`} style={{ padding: '0.375rem 0.875rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }}>
                      إدارة →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="q-mob" style={{ display: 'none', flexDirection: 'column' }}>
        {orders.map((o, i) => {
          const qs = o.quoteStatus ?? 'pending'
          const qc = quoteStatusColors[qs] ?? quoteStatusColors.pending
          return (
            <div key={o.id} style={{ padding: '1rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--blue-light)' }}>#{o.orderNumber}</span>
                <Badge label={quoteStatusLabels[qs] ?? qs} bg={qc.bg} text={qc.text} />
              </div>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{o.customerName ?? '—'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>
                  {o.quotePrice ? formatPrice(o.quotePrice) : 'لم يُحدد'}
                </span>
                <Link href={`/admin/orders/${o.id}`} style={{ padding: '0.375rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)', textDecoration: 'none' }}>
                  إدارة →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .q-desk { display: none !important; }
          .q-mob  { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
