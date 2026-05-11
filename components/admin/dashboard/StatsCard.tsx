// بطاقة إحصائية قابلة لإعادة الاستخدام

type StatsCardColor = 'blue' | 'warning' | 'success' | 'sky' | 'light'

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  color: StatsCardColor
  subtitle?: string
}

const colorMap: Record<StatsCardColor, { accent: string; bg: string; shadow: string }> = {
  blue:    { accent: 'var(--blue-primary)', bg: 'rgba(21,118,212,0.08)',   shadow: 'rgba(21,118,212,0.15)' },
  warning: { accent: 'var(--warning)',      bg: 'rgba(245,166,35,0.08)',   shadow: 'rgba(245,166,35,0.15)' },
  success: { accent: 'var(--success)',      bg: 'rgba(34,201,138,0.08)',   shadow: 'rgba(34,201,138,0.15)' },
  sky:     { accent: 'var(--blue-sky)',     bg: 'rgba(141,203,250,0.08)',  shadow: 'rgba(141,203,250,0.15)' },
  light:   { accent: 'var(--blue-light)',   bg: 'rgba(62,158,245,0.08)',   shadow: 'rgba(62,158,245,0.15)' },
}

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  const c = colorMap[color]

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: `1px solid var(--border)`,
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}>
      {/* خط عرضي ملون في الأعلى */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, left: 0,
        height: '3px',
        background: c.accent,
        borderRadius: '16px 16px 0 0',
      }} />

      {/* الصف العلوي: أيقونة + عنوان */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
          {title}
        </span>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '10px',
          backgroundColor: c.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem',
        }}>
          {icon}
        </div>
      </div>

      {/* الرقم الكبير */}
      <div>
        <p style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: c.accent,
          margin: 0,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
        </p>
        {subtitle && (
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-faint)',
            margin: '0.375rem 0 0',
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
