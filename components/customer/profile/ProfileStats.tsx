import type { ProfileStats } from '@/lib/data/profile'

interface StatCardProps {
  value: number
  label: string
  icon: string
  color: string
  bg: string
}

function StatCard({ value, label, icon, color, bg }: StatCardProps) {
  return (
    <div style={{
      padding: '1.25rem', borderRadius: '16px',
      backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      textAlign: 'center',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        backgroundColor: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.25rem',
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '2rem', fontWeight: 800, color, margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-second)', margin: 0 }}>
        {label}
      </p>
    </div>
  )
}

export default function ProfileStats({ stats }: { stats: ProfileStats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <StatCard
        value={stats.total}
        label="إجمالي الطلبات"
        icon="📦"
        color="var(--text-primary)"
        bg="var(--bg-surface2)"
      />
      <StatCard
        value={stats.completed}
        label="مكتمل"
        icon="✅"
        color="var(--success)"
        bg="rgba(34,201,138,0.1)"
      />
      <StatCard
        value={stats.active}
        label="نشط"
        icon="🔄"
        color="var(--blue-light)"
        bg="rgba(62,158,245,0.1)"
      />
    </div>
  )
}
