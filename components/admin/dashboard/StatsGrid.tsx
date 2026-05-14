import StatsCard from './StatsCard'
import type { DashboardStats } from '@/lib/data/admin/dashboard'
import { formatPrice } from '@/lib/utils/format'

interface StatsGridProps {
  stats: DashboardStats
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
          icon="📋"
          color="blue"
          subtitle="منذ البداية"
        />
        <StatsCard
          title="طلبات معلقة"
          value={stats.pendingOrders}
          icon="⏳"
          color="warning"
          subtitle="تحتاج مراجعة"
        />
        <StatsCard
          title="طلبات نشطة"
          value={stats.activeOrders}
          icon="🚀"
          color="light"
          subtitle="قيد التنفيذ"
        />
        <StatsCard
          title="مكتملة اليوم"
          value={stats.completedToday}
          icon="✅"
          color="success"
          subtitle="تم إنجازها اليوم"
        />
      </div>

      {/* الصف الثاني — العروض والعملاء */}
      <div style={gridStyle}>
        <StatsCard
          title="عروض بانتظار الرد"
          value={stats.pendingQuotes}
          icon="💬"
          color="warning"
          subtitle="تحتاج إرسال عرض"
        />
        <StatsCard
          title="عروض مرسلة"
          value={stats.sentQuotes}
          icon="📨"
          color="light"
          subtitle="في انتظار موافقة العميل"
        />
        <StatsCard
          title="إجمالي العملاء"
          value={stats.totalCustomers}
          icon="👥"
          color="sky"
          subtitle="عملاء مسجلون"
        />
        <StatsCard
          title="إجمالي الإيرادات"
          value={formatPrice(stats.totalRevenue)}
          icon="💰"
          color="success"
          subtitle="من الطلبات المكتملة"
        />
      </div>

      {/* الصف الثالث — الفريق والمنتجات */}
      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <StatsCard
          title="الفنيون"
          value={stats.totalTechnicians}
          icon="🔧"
          color="blue"
          subtitle="فنيون مسجلون"
        />
        <StatsCard
          title="المنتجات المتاحة"
          value={stats.totalAvailableProducts}
          icon="📦"
          color="light"
          subtitle="معروضة للبيع"
        />
        <StatsCard
          title="طلبات اليوم"
          value={stats.newOrdersToday}
          icon="🆕"
          color="warning"
          subtitle="واردة اليوم"
        />
        <StatsCard
          title="طلبات ملغية"
          value={stats.cancelledOrders}
          icon="❌"
          color="sky"
          subtitle="إجمالي الملغية"
        />
      </div>
    </div>
  )
}
