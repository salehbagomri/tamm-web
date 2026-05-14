import Link from 'next/link'
import type { AdminOrderRow } from '@/lib/data/admin/orders'
import type { OrderStatus, OrderType } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils/format'

const statusLabels: Record<OrderStatus, string> = {
  pending: 'معلق', confirmed: 'مؤكد', assigned: 'مُعيَّن',
  on_the_way: 'في الطريق', in_progress: 'قيد التنفيذ',
  completed: 'مكتمل', cancelled: 'ملغي',
}
const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending:     { bg: 'rgba(245,166,35,0.12)',  text: 'var(--warning)' },
  confirmed:   { bg: 'rgba(21,118,212,0.12)',  text: 'var(--blue-primary)' },
  assigned:    { bg: 'rgba(62,158,245,0.12)',  text: 'var(--blue-light)' },
  on_the_way:  { bg: 'rgba(141,203,250,0.12)', text: 'var(--blue-sky)' },
  in_progress: { bg: 'rgba(14,76,140,0.15)',   text: '#60a5fa' },
  completed:   { bg: 'rgba(34,201,138,0.12)',  text: 'var(--success)' },
  cancelled:   { bg: 'rgba(224,82,82,0.12)',   text: 'var(--error)' },
}
const typeLabels: Record<OrderType, string> = {
  product: 'منتجات', service: 'خدمات',
  product_and_service: 'منتج+خدمة', quote_request: 'عرض سعر',
}
const typeColors: Record<OrderType, { bg: string; text: string }> = {
  product:             { bg: 'rgba(21,118,212,0.1)',  text: 'var(--blue-primary)' },
  service:             { bg: 'rgba(34,201,138,0.1)',  text: 'var(--success)' },
  product_and_service: { bg: 'rgba(62,158,245,0.1)',  text: 'var(--blue-light)' },
  quote_request:       { bg: 'rgba(245,166,35,0.1)',  text: 'var(--warning)' },
}

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: bg, color: text, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminOrdersTable({ orders, totalCount }: { orders: AdminOrderRow[], totalCount: number }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
        لا توجد طلبات تطابق الفلتر الحالي
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
      {/* رأس الجدول */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>الطلبات</span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>إجمالي: {totalCount.toLocaleString('ar-SA')}</span>
      </div>

      {/* Desktop Table */}
      <div className="admin-tbl-desk">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface2)' }}>
              {['رقم الطلب', 'العميل', 'النوع', 'الحالة', 'الفني', 'المبلغ', 'التاريخ', ''].map((h) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={o.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 700, color: 'var(--blue-light)', fontSize: '0.875rem' }}>#{o.orderNumber}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{o.customerName ?? '—'}</p>
                  {o.customerPhone && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-faint)' }}>{o.customerPhone}</p>}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Badge label={typeLabels[o.orderType]} bg={typeColors[o.orderType].bg} text={typeColors[o.orderType].text} />
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Badge label={statusLabels[o.status]} bg={statusColors[o.status].bg} text={statusColors[o.status].text} />
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: o.technicianName ? 'var(--text-second)' : 'var(--text-faint)' }}>
                  {o.technicianName ?? '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {o.totalAmount > 0 ? formatPrice(o.totalAmount) : 'عند الطلب'}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                  {formatDate(o.createdAt)}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link href={`/admin/orders/${o.id}`} style={{ padding: '0.375rem 0.875rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }}>
                    إدارة →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="admin-tbl-mob" style={{ display: 'none', flexDirection: 'column' }}>
        {orders.map((o, i) => (
          <div key={o.id} style={{ padding: '1rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--blue-light)', fontSize: '0.9rem' }}>#{o.orderNumber}</span>
              <Badge label={statusLabels[o.status]} bg={statusColors[o.status].bg} text={statusColors[o.status].text} />
            </div>
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{o.customerName ?? '—'}</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
              <Badge label={typeLabels[o.orderType]} bg={typeColors[o.orderType].bg} text={typeColors[o.orderType].text} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{formatDate(o.createdAt)}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {o.totalAmount > 0 ? formatPrice(o.totalAmount) : 'عند الطلب'}
              </span>
            </div>
            <Link href={`/admin/orders/${o.id}`} style={{ display: 'inline-block', padding: '0.375rem 0.875rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)', textDecoration: 'none' }}>
              إدارة →
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .admin-tbl-desk { display: none !important; }
          .admin-tbl-mob  { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
