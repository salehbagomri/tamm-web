import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserNotifications } from '@/lib/data/notifications'
import AdminNotificationsList from '@/components/admin/AdminNotificationsList'

export const metadata = {
  title: 'التنبيهات — لوحة المدير',
}

export default async function AdminNotificationsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') redirect('/home')

  const initialNotifications = await getUserNotifications(user.id)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <AdminNotificationsList userId={user.id} initialNotifications={initialNotifications} />
    </div>
  )
}
