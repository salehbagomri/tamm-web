import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminTechnicians } from '@/lib/data/admin/technicians'
import AdminTechniciansTable from '@/components/admin/technicians/AdminTechniciansTable'
import AddTechnicianForm from '@/components/admin/technicians/AddTechnicianForm'

export const metadata = { title: 'إدارة الفنيين — تمّ' }

export default async function AdminTechniciansPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const technicians = await getAdminTechnicians()

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
          إدارة الفنيين
        </h1>
        <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9rem' }}>
          إجمالي {technicians.length} فني · متاح: {technicians.filter(t => t.isAvailable).length}
        </p>
      </div>

      <AddTechnicianForm />
      <AdminTechniciansTable technicians={technicians} />
    </div>
  )
}
