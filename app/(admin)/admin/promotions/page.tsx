import { getAdminPromotions } from '@/lib/data/admin/promotions'
import AdminPromotionsTable from '@/components/admin/promotions/AdminPromotionsTable'
import Link from 'next/link'

export const metadata = { title: 'إدارة العروض — تمّ' }

export default async function AdminPromotionsPage() {
  const promotions = await getAdminPromotions()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>إدارة العروض والسلايدر</h1>
          <p style={{ margin: 0, color: 'var(--text-second)', fontSize: '0.9rem' }}>
            إجمالي {promotions.length} عرض · نشط: {promotions.filter(p => p.isActive).length}
          </p>
        </div>
        <Link href="/admin/promotions/new" style={{
          padding: '0.625rem 1.25rem', borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
          color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          ➕ إضافة عرض جديد
        </Link>
      </div>

      <AdminPromotionsTable promotions={promotions} />
    </div>
  )
}
