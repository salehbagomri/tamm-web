import { getAdminTechnicianById, getAdminTechnicianOrders } from '@/lib/data/admin/technicians'
import { getTechnicianEarningsSummary } from '@/lib/data/admin/commissions'
import { TASK_TYPE_LABELS } from '@/lib/types/commission'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils/format'

export const metadata = { title: 'تفاصيل الفني — تمّ' }

export default async function TechnicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  const [technician, orders, earningsSummary] = await Promise.all([
    getAdminTechnicianById(resolvedParams.id),
    getAdminTechnicianOrders(resolvedParams.id),
    getTechnicianEarningsSummary(resolvedParams.id),
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

      {/* قسم المستحقات المالية */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
          💰 المستحقات المالية
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', padding: '1rem', borderRight: '3px solid var(--blue-primary)' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>هذا الشهر</p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue-light)' }}>{earningsSummary.thisMonth.toFixed(0)} ر.س</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', padding: '1rem', borderRight: '3px solid var(--warning)' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>معلق</p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)' }}>{earningsSummary.pending.toFixed(0)} ر.س</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', padding: '1rem', borderRight: '3px solid var(--success)' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>مصروف</p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>{earningsSummary.paid.toFixed(0)} ر.س</p>
          </div>
        </div>

        {earningsSummary.recentEarnings.length > 0 && (
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-second)', marginBottom: '0.5rem' }}>آخر المهام:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {earningsSummary.recentEarnings.map(e => (
                <div key={e.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-primary)',
                  fontSize: '0.8rem',
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-second)' }}>#{e.orderNumber ?? e.orderId.substring(0, 8)}</span>
                    <span style={{ color: 'var(--text-faint)' }}>{TASK_TYPE_LABELS[e.taskType]}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--blue-light)' }}>{e.commissionAmount.toFixed(0)} ر.س</span>
                    <span style={{
                      padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                      backgroundColor: e.isPaid ? 'rgba(34,201,138,0.15)' : 'rgba(245,166,35,0.15)',
                      color: e.isPaid ? 'var(--success)' : 'var(--warning)',
                    }}>{e.isPaid ? 'مصروف' : 'معلق'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                    {formatPrice(o.totalAmount)}
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
