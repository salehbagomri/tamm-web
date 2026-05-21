'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const STATUS_ARABIC: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  assigned: 'معين',
  on_the_way: 'في الطريق',
  in_progress: 'قيد العمل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

interface Props {
  period: string
  revenue: {
    totalRevenue: number
    productRevenue: number
    serviceRevenue: number
    installationRevenue: number
    orderCount: number
    dailyRevenue: Record<string, number>
  }
  cogs: { totalCOGS: number }
  commissions: { totalCommissions: number; paidCommissions: number; pendingCommissions: number }
  grossProfit: number
  netProfit: number
  profitMargin: number
  revenueChange: number
  topProducts: Array<{ name: string; imageUrl: string | null; totalSold: number; totalRevenue: number }>
  topServices: Array<{ name: string; totalRequests: number; totalRevenue: number }>
  techPerformance: Array<{ technicianId: string; name: string; taskCount: number; totalEarned: number }>
  ordersBreakdown: Record<string, { count: number; total: number }>
  inventory: {
    items: Array<{ id: string; name: string; price: number; costPrice: number; stockQuantity: number; isAvailable: boolean }>
    totalCostValue: number; totalRetailValue: number; expectedProfit: number
    lowStockCount: number; outOfStockCount: number; totalProducts: number
  }
}

export default function ReportsDashboard(props: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const changePeriod = (p: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', p)
    router.push(`/admin/reports?${params.toString()}`)
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })

  // حساب أعمدة الرسم البياني
  const dailyEntries = Object.entries(props.revenue.dailyRevenue).sort(([a], [b]) => a.localeCompare(b))
  const maxDaily = Math.max(...dailyEntries.map(([, v]) => v), 1)

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* العنوان وفلترة الفترة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            📊 التقارير المالية
          </h1>
          <p style={{ color: 'var(--text-second)', fontSize: '0.85rem', margin: 0 }}>
            نظرة شاملة على الأداء المالي لمنصة تمّ
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { key: '7', label: '7 أيام' },
            { key: '30', label: '30 يوم' },
            { key: '90', label: '3 أشهر' },
            { key: '365', label: 'سنة' },
          ].map(p => (
            <button key={p.key} onClick={() => changePeriod(p.key)} style={{
              padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${props.period === p.key ? 'var(--blue-primary)' : 'var(--border)'}`,
              backgroundColor: props.period === p.key ? 'rgba(21,118,212,0.15)' : 'var(--bg-surface)',
              color: props.period === p.key ? 'var(--blue-light)' : 'var(--text-second)',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* بطاقات الملخص الرئيسية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* الإيرادات */}
        <SummaryCard
          label="إجمالي الإيرادات"
          value={`${fmt(props.revenue.totalRevenue)} ر.س`}
          color="var(--blue-light)"
          borderColor="var(--blue-primary)"
          change={props.revenueChange}
          sub={`${props.revenue.orderCount} طلب مكتمل`}
        />
        {/* تكلفة البضاعة */}
        <SummaryCard
          label="تكلفة البضاعة (COGS)"
          value={`${fmt(props.cogs.totalCOGS)} ر.س`}
          color="var(--error)"
          borderColor="var(--error)"
        />
        {/* إجمالي الربح */}
        <SummaryCard
          label="إجمالي الربح"
          value={`${fmt(props.grossProfit)} ر.س`}
          color="var(--success)"
          borderColor="var(--success)"
        />
        {/* عمولات الفنيين */}
        <SummaryCard
          label="عمولات الفنيين"
          value={`${fmt(props.commissions.totalCommissions)} ر.س`}
          color="var(--warning)"
          borderColor="var(--warning)"
          sub={`معلق: ${fmt(props.commissions.pendingCommissions)} ر.س`}
        />
        {/* صافي الربح */}
        <SummaryCard
          label="صافي الربح"
          value={`${fmt(props.netProfit)} ر.س`}
          color={props.netProfit >= 0 ? 'var(--success)' : 'var(--error)'}
          borderColor={props.netProfit >= 0 ? 'var(--success)' : 'var(--error)'}
          sub={`هامش الربح: ${props.profitMargin.toFixed(1)}%`}
        />
      </div>

      {/* تقرير الأرباح والخسائر P&L */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>📋 تقرير الأرباح والخسائر</h2>
        <div style={{ fontSize: '0.9rem' }}>
          <PLRow label="مبيعات منتجات" value={props.revenue.productRevenue} color="var(--text-primary)" />
          <PLRow label="رسوم خدمات صيانة" value={props.revenue.serviceRevenue} color="var(--text-primary)" />
          <PLRow label="رسوم تركيب" value={props.revenue.installationRevenue} color="var(--text-primary)" />
          <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0', padding: '0.5rem 0' }}>
            <PLRow label="إجمالي الإيرادات" value={props.revenue.totalRevenue} color="var(--blue-light)" bold />
          </div>
          <PLRow label="تكلفة البضاعة (من المورد)" value={-props.cogs.totalCOGS} color="var(--error)" />
          <PLRow label="عمولات الفنيين" value={-props.commissions.totalCommissions} color="var(--warning)" />
          <div style={{ borderTop: '2px solid var(--border)', margin: '0.5rem 0', padding: '0.75rem 0' }}>
            <PLRow label="صافي الربح" value={props.netProfit} color={props.netProfit >= 0 ? 'var(--success)' : 'var(--error)'} bold large />
          </div>
        </div>
      </div>

      {/* الرسم البياني للإيرادات اليومية */}
      {dailyEntries.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>📈 الإيرادات اليومية</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '160px', paddingBottom: '1.5rem', position: 'relative' }}>
            {dailyEntries.map(([day, value]) => {
              const height = Math.max(4, (value / maxDaily) * 140)
              const label = day.substring(5) // MM-DD
              return (
                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{fmt(value)}</span>
                  <div style={{
                    width: '100%', maxWidth: '40px', height: `${height}px`,
                    borderRadius: '4px 4px 0 0',
                    background: 'linear-gradient(180deg, var(--blue-primary), var(--blue-dark))',
                    transition: 'height 0.3s',
                  }} title={`${day}: ${fmt(value)} ر.س`} />
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-faint)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* صفين: المنتجات + الخدمات */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {/* أكثر المنتجات مبيعاً */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>🏆 أكثر المنتجات مبيعاً</h2>
          {props.topProducts.length === 0 ? (
            <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>لا توجد بيانات</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {props.topProducts.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem', fontWeight: 700, minWidth: '1.5rem' }}>{i + 1}.</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ color: 'var(--blue-light)', fontWeight: 700, fontSize: '0.85rem' }}>{fmt(p.totalRevenue)} ر.س</span>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem', marginRight: '0.5rem' }}>({p.totalSold} وحدة)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* أكثر الخدمات طلباً */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>🔧 أكثر الخدمات طلباً</h2>
          {props.topServices.length === 0 ? (
            <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>لا توجد بيانات</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {props.topServices.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem', fontWeight: 700, minWidth: '1.5rem' }}>{i + 1}.</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ color: 'var(--blue-light)', fontWeight: 700, fontSize: '0.85rem' }}>{fmt(s.totalRevenue)} ر.س</span>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem', marginRight: '0.5rem' }}>({s.totalRequests} طلب)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* أداء الفنيين */}
      {props.techPerformance.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>👷 أداء الفنيين</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {props.techPerformance.map(t => (
              <div key={t.technicianId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--bg-surface2)',
              }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-faint)' }}>المهام</p>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{t.taskCount}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-faint)' }}>العمولة</p>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--blue-light)' }}>{fmt(t.totalEarned)} ر.س</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تفصيل الطلبات بالحالة */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>📦 تفصيل الطلبات</h2>
          {Object.keys(props.ordersBreakdown).length === 0 ? (
            <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>لا توجد بيانات</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(props.ordersBreakdown).map(([status, data]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-second)' }}>{STATUS_ARABIC[status] ?? status}</span>
                  <div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.count} طلب</span>
                    <span style={{ color: 'var(--text-faint)', marginRight: '0.5rem', fontSize: '0.8rem' }}>({fmt(data.total)} ر.س)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ملخص المخزون */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>📦 حالة المخزون</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-second)' }}>إجمالي المنتجات</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{props.inventory.totalProducts}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-second)' }}>قيمة المخزون (تكلفة)</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(props.inventory.totalCostValue)} ر.س</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-second)' }}>القيمة بسعر البيع</span>
              <span style={{ color: 'var(--blue-light)', fontWeight: 600 }}>{fmt(props.inventory.totalRetailValue)} ر.س</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-second)' }}>الربح المتوقع</span>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>{fmt(props.inventory.expectedProfit)} ر.س</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', gap: '1rem' }}>
              {props.inventory.outOfStockCount > 0 && (
                <span style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ نفد: {props.inventory.outOfStockCount}</span>
              )}
              {props.inventory.lowStockCount > 0 && (
                <span style={{ color: 'var(--warning)', fontSize: '0.8rem', fontWeight: 600 }}>⚡ وشك النفاد: {props.inventory.lowStockCount}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── مكونات مساعدة ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, color, borderColor, change, sub }: {
  label: string; value: string; color: string; borderColor: string; change?: number; sub?: string
}) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px',
      padding: '1.25rem', borderRight: `3px solid ${borderColor}`,
    }}>
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--text-faint)' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color }}>{value}</p>
      {change !== undefined && change !== 0 && (
        <span style={{
          fontSize: '0.75rem', fontWeight: 600,
          color: change > 0 ? 'var(--success)' : 'var(--error)',
        }}>
          {change > 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% عن الفترة السابقة
        </span>
      )}
      {sub && <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-faint)' }}>{sub}</p>}
    </div>
  )
}

function PLRow({ label, value, color, bold, large }: {
  label: string; value: number; color: string; bold?: boolean; large?: boolean
}) {
  const fmt = (n: number) => {
    const abs = Math.abs(n)
    const formatted = abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return n < 0 ? `(${formatted})` : formatted
  }
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.35rem 0', fontSize: large ? '1.1rem' : '0.9rem',
    }}>
      <span style={{ color: 'var(--text-second)', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 800 : 500 }}>{fmt(value)} ر.س</span>
    </div>
  )
}
