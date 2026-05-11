import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminServiceById } from '@/lib/data/admin/services'
import AdminServiceForm from '@/components/admin/services/AdminServiceForm'

interface PageProps { params: Promise<{ id: string }> }

export const metadata = { title: 'تعديل الخدمة — تمّ' }

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const service = await getAdminServiceById(id)
  if (!service) notFound()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.75rem' }}>
        تعديل: {service.name}
      </h1>
      <AdminServiceForm service={service} />
    </div>
  )
}
