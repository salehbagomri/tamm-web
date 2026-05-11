import Link from 'next/link'
import type { AdminOrderDetail } from '@/lib/data/admin/orders'
import type { OrderStatus, OrderType } from '@/lib/types/order'

const statusLabels: Record<OrderStatus, string> = {
  pending: 'معلق', confirmed: 'مؤكد', assigned: 'مُعيَّن',
  on_the_way: 'في الطريق', in_progress: 'قيد التنفيذ',
  completed: 'مكتمل', cancelled: 'ملغي',
}
const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending:     { bg: 'rgba(245,166,35,0.15)',  text: 'var(--warning)' },
  confirmed:   { bg: 'rgba(21,118,212,0.15)',  text: 'var(--blue-primary)' },
  assigned:    { bg: 'rgba(62,158,245,0.15)',  text: 'var(--blue-light)' },
  on_the_way:  { bg: 'rgba(141,203,250,0.15)', text: 'var(--blue-sky)' },
  in_progress: { bg: 'rgba(14,76,140,0.2)',    text: '#60a5fa' },
  completed:   { bg: 'rgba(34,201,138,0.15)',  text: 'var(--success)' },
  cancelled:   { bg: 'rgba(224,82,82,0.15)',   text: 'var(--error)' },
}
const typeLabels: Record<OrderType, string> = {
  product: 'منتجات', service: 'خدمات',
  product_and_service: 'منتج + خدمة', quote_request: 'عرض سعر',
}

export default function AdminOrderHeader({ order }: { order: AdminOrderDetail }) {
  const sc = statusColors[order.status]

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    }}>
      {/* المعلومات الأساسية */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link href="/admin/orders" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          fontSize: '0.8125rem', color: 'var(--text-faint)',
          textDecoration: 'none', marginBottom: '0.25rem',
        }}>
          ← العودة للطلبات
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            طلب #{order.orderNumber}
          </h1>
          <span style={{
            padding: '0.25rem 0.75rem', borderRadius: '999px',
            fontSize: '0.8rem', fontWeight: 700,
            backgroundColor: 'rgba(21,118,212,0.1)',
            color: 'var(--blue-light)',
          }}>
            {typeLabels[order.orderType]}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-second)' }}>
          {new Date(order.createdAt).toLocaleDateString('ar-SA', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* Badge الحالة */}
      <span style={{
        padding: '0.5rem 1.25rem',
        borderRadius: '999px',
        fontSize: '1rem',
        fontWeight: 800,
        backgroundColor: sc.bg,
        color: sc.text,
        border: `1px solid ${sc.text}30`,
        whiteSpace: 'nowrap',
      }}>
        {statusLabels[order.status]}
      </span>
    </div>
  )
}
