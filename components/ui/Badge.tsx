import React from 'react'
import type { OrderStatus } from '@/lib/types/order'

interface BadgeProps {
  status: OrderStatus
  className?: string
}

// ألوان وتسميات حالات الطلب
const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: 'قيد الانتظار',
    color: 'var(--warning)',
    bg: 'rgba(245, 166, 35, 0.12)',
    border: 'rgba(245, 166, 35, 0.3)',
  },
  confirmed: {
    label: 'مؤكّد',
    color: 'var(--blue-light)',
    bg: 'rgba(62, 158, 245, 0.12)',
    border: 'rgba(62, 158, 245, 0.3)',
  },
  assigned: {
    label: 'تم التعيين',
    color: 'var(--blue-sky)',
    bg: 'rgba(141, 203, 250, 0.12)',
    border: 'rgba(141, 203, 250, 0.3)',
  },
  on_the_way: {
    label: 'في الطريق',
    color: 'var(--blue-primary)',
    bg: 'rgba(21, 118, 212, 0.12)',
    border: 'rgba(21, 118, 212, 0.3)',
  },
  in_progress: {
    label: 'جاري التنفيذ',
    color: 'var(--blue-light)',
    bg: 'rgba(62, 158, 245, 0.12)',
    border: 'rgba(62, 158, 245, 0.3)',
  },
  completed: {
    label: 'مكتمل',
    color: 'var(--success)',
    bg: 'rgba(34, 201, 138, 0.12)',
    border: 'rgba(34, 201, 138, 0.3)',
  },
  cancelled: {
    label: 'ملغى',
    color: 'var(--error)',
    bg: 'rgba(224, 82, 82, 0.12)',
    border: 'rgba(224, 82, 82, 0.3)',
  },
}

export default function Badge({ status, className }: BadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  )
}
