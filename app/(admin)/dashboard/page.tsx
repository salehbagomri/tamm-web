import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getDashboardStats } from '@/lib/data/admin/dashboard'
import StatsGrid from '@/components/admin/dashboard/StatsGrid'
import RecentOrdersTable from '@/components/admin/dashboard/RecentOrdersTable'
import OrdersDistributionCard from '@/components/admin/dashboard/OrdersDistributionCard'
import OrdersStatusCard from '@/components/admin/dashboard/OrdersStatusCard'
import QuickActionsCard from '@/components/admin/dashboard/QuickActionsCard'

export const metadata = {
  title: 'لوحة التحكم — تمّ',
  description: 'لوحة تحكم المدير — إحصائيات ومتابعة الطلبات',
}

export default async function AdminDashboardPage() {
  // التحقق من صلاحية المدير
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') redirect('/home')

  // جلب الإحصائيات
  const stats = await getDashboardStats()

  const now = new Date()
  const timeLabel = now.toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* رأس الصفحة */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 800,
          color: 'var(--text-primary)', margin: '0 0 0.375rem',
        }}>
          لوحة التحكم
        </h1>
        <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9rem' }}>
          مرحباً {profile?.full_name ?? 'المدير'} — {timeLabel}
        </p>
      </div>

      {/* شبكة البطاقات الإحصائية */}
      <StatsGrid stats={stats} />

      {/* الصف السفلي — الجدول + البطاقات الجانبية */}
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: '1fr 360px',
        marginTop: '1.5rem',
      }}
        className="admin-dashboard-bottom"
      >
        {/* عمود يسار: جدول الطلبات + التوزيع حسب الحالة */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RecentOrdersTable orders={stats.recentOrders} />
          <OrdersStatusCard ordersByStatus={stats.ordersByStatus} />
        </div>

        {/* عمود يمين: الإجراءات السريعة + توزيع الأنواع */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <QuickActionsCard
            pendingOrders={stats.pendingOrders}
            pendingQuotes={stats.pendingQuotes}
          />
          <OrdersDistributionCard
            ordersByType={stats.ordersByType}
            total={stats.totalOrders}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .admin-dashboard-bottom {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
