import React from 'react'
import type { ProfileStats } from '@/lib/data/profile'

interface StatCardProps {
  value: number
  label: string
  icon: React.ReactNode
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
        justifyContent: 'center', color,
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
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
          </svg>
        }
        color="var(--text-primary)"
        bg="var(--bg-surface2)"
      />
      <StatCard
        value={stats.completed}
        label="مكتمل"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        }
        color="var(--success)"
        bg="rgba(34,201,138,0.1)"
      />
      <StatCard
        value={stats.active}
        label="نشط"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        }
        color="var(--blue-light)"
        bg="rgba(62,158,245,0.1)"
      />
    </div>
  )
}
