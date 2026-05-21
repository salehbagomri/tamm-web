import { getEarningsSummaryByTechnician, getTechnicianEarnings } from '@/lib/data/admin/commissions'
import EarningsTable from '@/components/admin/technicians/EarningsTable'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'مستحقات الفنيين | تمّ',
}

export default async function TechnicianEarningsPage() {
  const [summary, allEarnings] = await Promise.all([
    getEarningsSummaryByTechnician(),
    getTechnicianEarnings(),
  ])

  // حساب الإجماليات
  const totalPending = summary.reduce((s, t) => s + t.totalPending, 0)
  const totalPaid = summary.reduce((s, t) => s + t.totalPaid, 0)
  const totalAll = summary.reduce((s, t) => s + t.totalEarned, 0)

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          💰 مستحقات الفنيين
        </h1>
        <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
          متابعة وإدارة عمولات الفنيين وتسجيل عمليات الصرف
        </p>
      </div>

      {/* بطاقات الملخص */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.25rem',
          borderRight: '3px solid var(--warning)',
        }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--text-faint)' }}>مستحقات معلقة</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>
            {totalPending.toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>ر.س</span>
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.25rem',
          borderRight: '3px solid var(--success)',
        }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--text-faint)' }}>تم صرفها</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
            {totalPaid.toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>ر.س</span>
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.25rem',
          borderRight: '3px solid var(--blue-primary)',
        }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--text-faint)' }}>إجمالي العمولات</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-light)' }}>
            {totalAll.toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>ر.س</span>
          </p>
        </div>
      </div>

      {/* ملخص لكل فني */}
      {summary.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>ملخص الفنيين</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summary.map(t => (
              <div key={t.technicianId} style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.technicianName}</span>
                  <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem', marginRight: '0.5rem' }}>({t.taskCount} مهمة)</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-faint)' }}>معلق</p>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--warning)', fontSize: '0.95rem' }}>{t.totalPending.toFixed(0)} ر.س</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-faint)' }}>مصروف</p>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--success)', fontSize: '0.95rem' }}>{t.totalPaid.toFixed(0)} ر.س</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* جدول المستحقات التفصيلي */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>سجل المستحقات</h2>
      <EarningsTable earnings={allEarnings} />
    </div>
  )
}
