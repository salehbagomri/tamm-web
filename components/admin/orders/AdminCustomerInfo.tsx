import type { AdminOrderDetail } from '@/lib/data/admin/orders'

const TIME_SLOT_LABELS: Record<string, string> = {
  '8AM-12PM': 'صباحاً (8 ص - 12 م)',
  '12PM-4PM': 'ظهراً (12 م - 4 م)',
  '4PM-8PM':  'مساءً (4 م - 8 م)',
}

export default function AdminCustomerInfo({ order }: { order: AdminOrderDetail }) {
  const customer = order.customerProfile

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* بيانات العميل */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          👤 بيانات العميل
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          {[
            { label: 'الاسم',   value: customer?.fullName ?? '—' },
            { label: 'الجوال',  value: customer?.phone ?? '—' },
            { label: 'العنوان', value: order.address, full: true },
          ].map((row) => (
            <div key={row.label} style={{
              ...(row.full ? { gridColumn: '1 / -1' } : {}),
              backgroundColor: 'var(--bg-surface2)',
              borderRadius: '10px', padding: '0.875rem 1rem',
            }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>{row.label}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* الموعد المفضل */}
      {(order.preferredDate || order.preferredTimeSlot) && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            📅 الموعد المفضل
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {order.preferredDate && (
              <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem 1rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>التاريخ</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{order.preferredDate}</p>
              </div>
            )}
            {order.preferredTimeSlot && (
              <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem 1rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>الوقت</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {TIME_SLOT_LABELS[order.preferredTimeSlot] ?? order.preferredTimeSlot}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ملاحظات العميل */}
      {order.notes && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.875rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            📝 ملاحظات العميل
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-second)', lineHeight: 1.6 }}>{order.notes}</p>
        </div>
      )}

      {/* عناصر الطلب */}
      {order.items.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📦 عناصر الطلب ({order.items.length})
            </h3>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {order.items.map((item, i) => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1.5rem',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <p style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {item.product?.name ?? item.service?.name ?? `عنصر ${item.itemType}`}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>الكمية: {item.quantity}</span>
                    {item.includeInstallation && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--blue-light)', backgroundColor: 'rgba(62,158,245,0.1)', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                        🛠 شامل التركيب
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {item.totalPrice > 0 ? `${item.totalPrice.toLocaleString('ar-SA')} ر.س` : 'عند الطلب'}
                  </p>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                    {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString('ar-SA')} × ${item.quantity}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* الإجمالي */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'rgba(21,118,212,0.05)',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>الإجمالي</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--blue-light)' }}>
              {order.totalAmount > 0 ? `${order.totalAmount.toLocaleString('ar-SA')} ر.س` : 'عند الطلب'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
