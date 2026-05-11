import { getAdminTechnicianById, getAdminTechnicianOrders } from '@/lib/data/admin/technicians'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = { title: 'تفاصيل الفني — تمّ' }

export default async function TechnicianDetailPage({ params }: { params: { id: string } }) {
  const [technician, orders] = await Promise.all([
    getAdminTechnicianById(params.id),
    getAdminTechnicianOrders(params.id),
  ])

  if (!technician) return notFound()

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          تفاصيل الفني
        </h1>
        <Link href="/admin/technicians" style={{
          padding: '0.625rem 1.25rem', borderRadius: '10px',
          backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
          color: 'var(--text-second)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem'
        }}>
          العودة للقائمة
        </Link>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.75rem', flexShrink: 0 }}>
          {technician.name.charAt(0)}
        </div>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            {technician.name}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>
            <span>📞 {technician.phone ?? 'لا يوجد'}</span>
            <span>✉️ {technician.email ?? 'لا يوجد'}</span>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
              backgroundColor: technician.isAvailable ? 'rgba(34,201,138,0.1)' : 'rgba(245,166,35,0.1)',
              color: technician.isAvailable ? 'var(--success)' : 'var(--warning)',
            }}>
              {technician.isAvailable ? 'متاح للعمل' : 'مشغول'}
            </span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
        سجل الطلبات المعينة ({orders.length})
      </h3>

      {orders.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-faint)' }}>
          لم يتم تعيين أي طلبات لهذا الفني بعد.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((o) => (
            <div key={o.id} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <Link href={`/admin/orders/${o.orderId}`} style={{ textDecoration: 'none' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--blue-light)', fontWeight: 700 }}>
                      طلب #{o.orderNumber}
                    </h4>
                  </Link>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-second)' }}>
                    العميل: <strong style={{ color: 'var(--text-primary)' }}>{o.customerName ?? '—'}</strong>
                    <br />
                    العنوان: {o.address ?? '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>
                    {new Date(o.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                  <div style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {o.totalAmount} ريال
                  </div>
                </div>
              </div>

              {o.technicianNotes && (
                <div style={{ backgroundColor: 'var(--bg-surface2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '0.25rem' }}>ملاحظات الفني:</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {o.technicianNotes}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
