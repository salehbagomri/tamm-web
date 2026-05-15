import type { Order } from '@/lib/types/order'

export default function TechnicianCard({ order }: { order: Order }) {
  if (!['assigned', 'on_the_way', 'in_progress', 'completed'].includes(order.status)) return null

  // if there's no technician name
  if (!order.technicianName) {
    if (order.status !== 'completed') {
      return (
        <div style={{ backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9375rem' }}>جاري تعيين فني لطلبك...</p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(21,118,212,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-primary)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.125rem' }}>
            الفني المعين
          </h3>
          <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', margin: 0 }}>
            {order.technicianName}
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(order.scheduledPeriod || order.scheduledHour) && (
          <div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0 0 0.25rem' }}>الموعد المجدول</p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
              {order.scheduledPeriod === 'morning' ? 'صباحاً' : order.scheduledPeriod === 'afternoon' ? 'ظهراً' : order.scheduledPeriod === 'evening' ? 'مساءً' : ''} {order.scheduledHour ? `- ${order.scheduledHour}` : ''}
            </p>
          </div>
        )}

        {order.technicianNotes && (
          <div style={{ marginTop: '0.25rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--warning)', margin: '0 0 0.25rem' }}>ملاحظات الفني</p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0 }}>{order.technicianNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
