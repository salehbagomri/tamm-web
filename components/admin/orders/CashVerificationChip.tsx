import type { AdminOrderDetail } from '@/lib/data/admin/orders'

interface CashVerificationChipProps {
  order: AdminOrderDetail
}

type ChipState = {
  label: string
  emoji: string
  color: string
  bg: string
  border: string
  hint: string
}

function resolveState(order: AdminOrderDetail): ChipState {
  if (!order.cashCollected) {
    return {
      label: 'بانتظار تأكيد الفني',
      emoji: '⏳',
      color: 'var(--text-second)',
      bg: 'var(--bg-surface2)',
      border: 'var(--border)',
      hint: 'لم يؤكد الفني بعد استلام النقد من العميل.',
    }
  }
  if (order.cashAcknowledgedByCustomer === true) {
    return {
      label: 'موثّق',
      emoji: '✅',
      color: '#16a34a',
      bg: 'rgba(34, 201, 138, 0.12)',
      border: 'rgba(34, 201, 138, 0.35)',
      hint: 'الفني أكد استلام النقد والعميل أكد تسليمه — العملية موثّقة من الطرفين.',
    }
  }
  if (order.cashAcknowledgedByCustomer === false) {
    return {
      label: 'نزاع — يحتاج تدخل',
      emoji: '🚨',
      color: '#dc2626',
      bg: 'rgba(224, 82, 82, 0.12)',
      border: 'rgba(224, 82, 82, 0.4)',
      hint: 'الفني أكد الاستلام لكن العميل أبلغ بمشكلة — يلزم تواصل المدير لحل النزاع.',
    }
  }
  // cashCollected=true, customer=null
  return {
    label: 'بانتظار رد العميل',
    emoji: '⏳',
    color: '#a16207',
    bg: 'rgba(245, 158, 11, 0.14)',
    border: 'rgba(245, 158, 11, 0.4)',
    hint: 'الفني أكد استلام النقد، وننتظر تأكيد العميل عبر التطبيق.',
  }
}

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleString('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function CashVerificationChip({ order }: CashVerificationChipProps) {
  const state = resolveState(order)
  const collectedAt = formatDateTime(order.cashCollectedAt)
  const acknowledgedAt = formatDateTime(order.cashAcknowledgedAt)

  return (
    <div
      style={{
        backgroundColor: state.bg,
        border: `1px solid ${state.border}`,
        borderRadius: '12px',
        padding: '0.875rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: state.color,
            color: '#fff',
            fontSize: '0.78rem',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: '0.85rem' }}>{state.emoji}</span>
          <span>{state.label}</span>
        </span>
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-second)',
            fontWeight: 600,
          }}
        >
          تأكيد استلام النقد
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '0.82rem',
          color: state.color,
          lineHeight: 1.5,
        }}
      >
        {state.hint}
      </p>

      {(collectedAt || acknowledgedAt) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.5rem',
            marginTop: '0.25rem',
          }}
        >
          {collectedAt && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border)',
              }}
            >
              <p style={{ margin: '0 0 0.15rem', fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                تأكيد الفني
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {collectedAt}
              </p>
            </div>
          )}
          {acknowledgedAt && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border)',
              }}
            >
              <p style={{ margin: '0 0 0.15rem', fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                رد العميل
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {acknowledgedAt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
