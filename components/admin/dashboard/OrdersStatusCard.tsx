import type { DashboardStats } from '@/lib/data/admin/dashboard'
import type { OrderStatus } from '@/lib/types/order'

interface OrdersStatusCardProps {
  ordersByStatus: DashboardStats['ordersByStatus']
}

const statusLabels: Record<OrderStatus, string> = {
  pending:     'معلق',
  confirmed:   'مؤكد',
  assigned:    'مُعيَّن',
  on_the_way:  'في الطريق',
  in_progress: 'قيد التنفيذ',
  completed:   'مكتمل',
  cancelled:   'ملغي',
}

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending:     { bg: 'rgba(245,166,35,0.12)',   text: 'var(--warning)' },
  confirmed:   { bg: 'rgba(21,118,212,0.12)',   text: 'var(--blue-primary)' },
  assigned:    { bg: 'rgba(62,158,245,0.12)',   text: 'var(--blue-light)' },
  on_the_way:  { bg: 'rgba(141,203,250,0.12)',  text: 'var(--blue-sky)' },
  in_progress: { bg: 'rgba(14,76,140,0.15)',    text: '#60a5fa' },
  completed:   { bg: 'rgba(34,201,138,0.12)',   text: 'var(--success)' },
  cancelled:   { bg: 'rgba(224,82,82,0.12)',    text: 'var(--error)' },
}

export default function OrdersStatusCard({ ordersByStatus }: OrdersStatusCardProps) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.5rem',
    }}>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: '0 0 1.25rem',
      }}>
        🏷 توزيع الطلبات حسب الحالة
      </h3>

      {ordersByStatus.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '2rem 0' }}>
          لا توجد طلبات بعد
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {ordersByStatus.map((item) => {
            const colors = statusColors[item.status]
            return (
              <div key={item.status} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                backgroundColor: 'var(--bg-surface2)',
                borderRadius: '10px',
              }}>
                {/* Badge الحالة */}
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}>
                  {statusLabels[item.status]}
                </span>

                {/* العدد */}
                <span style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: colors.text,
                }}>
                  {item.count.toLocaleString('ar-SA')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
