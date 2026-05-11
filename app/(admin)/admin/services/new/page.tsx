import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminServiceForm from '@/components/admin/services/AdminServiceForm'

export const metadata = { title: 'إضافة خدمة جديدة — تمّ' }

export default async function NewServicePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.75rem' }}>
        إضافة خدمة جديدة
      </h1>
      <AdminServiceForm />
    </div>
  )
}
