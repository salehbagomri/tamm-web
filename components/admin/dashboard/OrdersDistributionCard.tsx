import type { DashboardStats } from '@/lib/data/admin/dashboard'
import type { OrderType } from '@/lib/types/order'

interface OrdersDistributionCardProps {
  ordersByType: DashboardStats['ordersByType']
  total: number
}

const typeLabels: Record<OrderType, string> = {
  product: 'منتجات',
  service: 'خدمات',
  product_and_service: 'منتجات + خدمات',
  quote_request: 'عروض أسعار',
}

const typeColors: Record<OrderType, string> = {
  product: 'var(--blue-primary)',
  service: 'var(--success)',
  product_and_service: 'var(--blue-light)',
  quote_request: 'var(--warning)',
}

const typeIcons: Record<OrderType, string> = {
  product: '📦',
  service: '🔧',
  product_and_service: '🛍',
  quote_request: '💬',
}

export default function OrdersDistributionCard({ ordersByType, total }: OrdersDistributionCardProps) {
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
        margin: '0 0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        📊 توزيع الطلبات حسب النوع
      </h3>

      {total === 0 ? (
        <p style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '2rem 0' }}>
          لا توجد طلبات بعد
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {ordersByType.map((item) => (
            <div key={item.type}>
              {/* الصف العلوي: الاسم + العدد */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-second)', fontSize: '0.875rem' }}>
                  {typeIcons[item.type]} {typeLabels[item.type]}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.count} ({item.percentage}%)
                </span>
              </div>

              {/* شريط النسبة */}
              <div style={{
                height: '8px',
                backgroundColor: 'var(--bg-surface2)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${item.percentage}%`,
                  backgroundColor: typeColors[item.type],
                  borderRadius: '999px',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* الإجمالي */}
      <div style={{
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.8125rem' }}>الإجمالي</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{total} طلب</span>
      </div>
    </div>
  )
}
