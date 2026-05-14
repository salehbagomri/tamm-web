import Link from 'next/link'
import type { DashboardStats } from '@/lib/data/admin/dashboard'
import type { OrderStatus, OrderType } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils/format'

interface RecentOrdersTableProps {
  orders: DashboardStats['recentOrders']
}

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
  product_and_service: 'منتج + خدمة', quote_request: 'عرض سعر',
}

const typeColors: Record<OrderType, { bg: string; text: string }> = {
  product:             { bg: 'rgba(21,118,212,0.12)',  text: 'var(--blue-primary)' },
  service:             { bg: 'rgba(34,201,138,0.12)',  text: 'var(--success)' },
  product_and_service: { bg: 'rgba(62,158,245,0.12)',  text: 'var(--blue-light)' },
  quote_request:       { bg: 'rgba(245,166,35,0.12)',  text: 'var(--warning)' },
}

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: 600,
      backgroundColor: bg, color: text,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* الرأس */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          🕐 آخر الطلبات
        </h3>
        <Link href="/admin/orders" style={{
          fontSize: '0.8125rem', color: 'var(--blue-light)',
          textDecoration: 'none', fontWeight: 500,
        }}>
          عرض الكل ←
        </Link>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '3rem 0' }}>
          لا توجد طلبات بعد
        </p>
      ) : (
        <>
          {/* Desktop: Table */}
          <div className="admin-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface2)' }}>
                  {['رقم الطلب', 'العميل', 'النوع', 'الحالة', 'المبلغ', 'التاريخ', ''].map((h) => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem', textAlign: 'right',
                      fontSize: '0.8125rem', color: 'var(--text-faint)',
                      fontWeight: 600, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order.id} style={{
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                    transition: 'background-color 0.15s',
                  }}>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--blue-light)' }}>
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {order.customerName ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge
                        label={typeLabels[order.orderType]}
                        bg={typeColors[order.orderType].bg}
                        text={typeColors[order.orderType].text}
                      />
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge
                        label={statusLabels[order.status]}
                        bg={statusColors[order.status].bg}
                        text={statusColors[order.status].text}
                      />
                    </td>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {order.totalAmount > 0 ? formatPrice(order.totalAmount) : 'عند الطلب'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Link href={`/admin/orders/${order.id}`} style={{
                        padding: '0.375rem 0.875rem',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(21,118,212,0.1)',
                        color: 'var(--blue-light)',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                      }}>
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="admin-cards-wrapper" style={{ display: 'none', flexDirection: 'column', gap: '0' }}>
            {orders.map((order, i) => (
              <div key={order.id} style={{
                padding: '1rem 1.25rem',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--blue-light)', fontSize: '0.9rem' }}>
                    #{order.orderNumber}
                  </span>
                  <Badge
                    label={statusLabels[order.status]}
                    bg={statusColors[order.status].bg}
                    text={statusColors[order.status].text}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-second)' }}>
                      {order.customerName ?? '—'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Badge
                        label={typeLabels[order.orderType]}
                        bg={typeColors[order.orderType].bg}
                        text={typeColors[order.orderType].text}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.375rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {order.totalAmount > 0 ? formatPrice(order.totalAmount) : 'عند الطلب'}
                    </span>
                    <Link href={`/admin/orders/${order.id}`} style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)',
                      textDecoration: 'none',
                    }}>
                      عرض
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 640px) {
          .admin-table-wrapper { display: none !important; }
          .admin-cards-wrapper { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
