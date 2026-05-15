import StatsCard from './StatsCard'
import type { DashboardStats } from '@/lib/data/admin/dashboard'
import { formatPrice } from '@/lib/utils/format'

interface StatsGridProps {
  stats: DashboardStats
}

const ICONS = {
  orders: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
    </svg>
  ),
  pending: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  active: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  completed: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  quotes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  sent: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  customers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  revenue: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v12M8 10h8M8 14h6"/>
    </svg>
  ),
  technicians: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  products: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
    </svg>
  ),
  newToday: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  cancelled: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const gridStyle = {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    marginBottom: '1rem',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* الصف الأول — الطلبات */}
      <div style={gridStyle}>
        <StatsCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon={ICONS.orders}
          color="blue"
          subtitle="منذ البداية"
        />
        <StatsCard
          title="طلبات معلقة"
          value={stats.pendingOrders}
          icon={ICONS.pending}
          color="warning"
          subtitle="تحتاج مراجعة"
        />
        <StatsCard
          title="طلبات نشطة"
          value={stats.activeOrders}
          icon={ICONS.active}
          color="light"
          subtitle="قيد التنفيذ"
        />
        <StatsCard
          title="مكتملة اليوم"
          value={stats.completedToday}
          icon={ICONS.completed}
          color="success"
          subtitle="تم إنجازها اليوم"
        />
      </div>

      {/* الصف الثاني — العروض والعملاء */}
      <div style={gridStyle}>
        <StatsCard
          title="عروض بانتظار الرد"
          value={stats.pendingQuotes}
          icon={ICONS.quotes}
          color="warning"
          subtitle="تحتاج إرسال عرض"
        />
        <StatsCard
          title="عروض مرسلة"
          value={stats.sentQuotes}
          icon={ICONS.sent}
          color="light"
          subtitle="في انتظار موافقة العميل"
        />
        <StatsCard
          title="إجمالي العملاء"
          value={stats.totalCustomers}
          icon={ICONS.customers}
          color="sky"
          subtitle="عملاء مسجلون"
        />
        <StatsCard
          title="إجمالي الإيرادات"
          value={formatPrice(stats.totalRevenue)}
          icon={ICONS.revenue}
          color="success"
          subtitle="من الطلبات المكتملة"
        />
      </div>

      {/* الصف الثالث — الفريق والمنتجات */}
      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <StatsCard
          title="الفنيون"
          value={stats.totalTechnicians}
          icon={ICONS.technicians}
          color="blue"
          subtitle="فنيون مسجلون"
        />
        <StatsCard
          title="المنتجات المتاحة"
          value={stats.totalAvailableProducts}
          icon={ICONS.products}
          color="light"
          subtitle="معروضة للبيع"
        />
        <StatsCard
          title="طلبات اليوم"
          value={stats.newOrdersToday}
          icon={ICONS.newToday}
          color="warning"
          subtitle="واردة اليوم"
        />
        <StatsCard
          title="طلبات ملغية"
          value={stats.cancelledOrders}
          icon={ICONS.cancelled}
          color="sky"
          subtitle="إجمالي الملغية"
        />
      </div>
    </div>
  )
}
