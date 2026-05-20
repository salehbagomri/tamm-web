import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { getDashboardStats } from '@/lib/data/admin/dashboard'
import { getUnreadNotificationsCount } from '@/lib/data/notifications'

// Layout للمدير — مع Sidebar جانبي
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') redirect('/home')

  // جلب أعداد الطلبات المعلقة للـ Sidebar badges
  const [stats, unreadNotifications] = await Promise.all([
    getDashboardStats(),
    getUnreadNotificationsCount(user.id),
  ])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <AdminSidebar
        managerId={user.id}
        managerName={profile?.full_name}
        pendingOrders={stats.pendingOrders}
        pendingQuotes={stats.pendingQuotes}
        unreadNotifications={unreadNotifications}
      />
      <main
        style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          paddingTop: '2rem',
        }}
      >
        {children}
      </main>
    </div>
  )
}
