import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminServices } from '@/lib/data/admin/services'
import AdminServicesTable from '@/components/admin/services/AdminServicesTable'

export const metadata = { title: 'إدارة الخدمات — تمّ' }

export default async function AdminServicesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const services = await getAdminServices()

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>إدارة الخدمات</h1>
          <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9rem' }}>إجمالي {services.length} خدمة</p>
        </div>
        <Link href="/admin/services/new" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
          + إضافة خدمة
        </Link>
      </div>
      <AdminServicesTable services={services} />
    </div>
  )
}
