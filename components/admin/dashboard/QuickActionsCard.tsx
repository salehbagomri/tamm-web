import Link from 'next/link'
import type { DashboardStats } from '@/lib/data/admin/dashboard'

interface QuickActionsCardProps {
  pendingOrders: number
  pendingQuotes: number
}

const actions = [
  {
    id: 'pending-orders',
    label: 'الطلبات المعلقة',
    description: 'طلبات تحتاج مراجعة وتأكيد',
    icon: '⏳',
    href: '/admin/orders?status=pending',
    color: 'var(--warning)',
    bg: 'rgba(245,166,35,0.08)',
    border: 'rgba(245,166,35,0.2)',
    countKey: 'pendingOrders',
  },
  {
    id: 'pending-quotes',
    label: 'عروض تحتاج رد',
    description: 'عروض أسعار بانتظار الإرسال',
    icon: '💬',
    href: '/admin/quotes?status=pending',
    color: 'var(--blue-light)',
    bg: 'rgba(62,158,245,0.08)',
    border: 'rgba(62,158,245,0.2)',
    countKey: 'pendingQuotes',
  },
  {
    id: 'new-product',
    label: 'إضافة منتج جديد',
    description: 'أضف منتجاً جديداً للمتجر',
    icon: '➕',
    href: '/admin/products/new',
    color: 'var(--success)',
    bg: 'rgba(34,201,138,0.08)',
    border: 'rgba(34,201,138,0.2)',
    countKey: null,
  },
] as const

export default function QuickActionsCard({ pendingOrders, pendingQuotes }: QuickActionsCardProps) {
  const counts: Record<string, number> = {
    pendingOrders,
    pendingQuotes,
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.5rem',
    }}>
      <h3 style={{
        fontSize: '1rem', fontWeight: 700,
        color: 'var(--text-primary)', margin: '0 0 1.25rem',
      }}>
        ⚡ إجراءات سريعة
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {actions.map((action) => {
          const count = action.countKey ? counts[action.countKey] : null

          return (
            <Link key={action.id} href={action.href} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.875rem 1rem',
              backgroundColor: action.bg,
              border: `1px solid ${action.border}`,
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}>
              {/* أيقونة */}
              <div style={{
                width: '42px', height: '42px', flexShrink: 0,
                borderRadius: '10px',
                backgroundColor: 'var(--bg-surface2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
              }}>
                {action.icon}
              </div>

              {/* النص */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontWeight: 600, fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                }}>
                  {action.label}
                </p>
                <p style={{
                  margin: '0.125rem 0 0', fontSize: '0.75rem',
                  color: 'var(--text-faint)',
                }}>
                  {action.description}
                </p>
              </div>

              {/* Badge العدد */}
              {count !== null && count > 0 && (
                <span style={{
                  minWidth: '28px', height: '28px',
                  borderRadius: '999px',
                  backgroundColor: action.color,
                  color: '#fff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 6px',
                  flexShrink: 0,
                }}>
                  {count}
                </span>
              )}

              <span style={{ color: action.color, fontSize: '1.1rem', flexShrink: 0 }}>←</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
