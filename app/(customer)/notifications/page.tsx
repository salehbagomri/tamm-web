import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserNotifications } from '@/lib/data/notifications'
import NotificationsList from '@/components/customer/NotificationsList'

export const metadata = {
  title: 'الإشعارات — تمّ',
}

export default async function NotificationsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialNotifications = await getUserNotifications(user.id)

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <NotificationsList userId={user.id} initialNotifications={initialNotifications} />
    </div>
  )
}
