import Link from 'next/link'

interface AccountHubCardProps {
  href: string
  title: string
  description: string
  icon: React.ReactNode
  badge?: { text: string; tone: 'info' | 'warning' | 'danger' | 'success' }
  disabled?: boolean
}

const BADGE_STYLES: Record<NonNullable<AccountHubCardProps['badge']>['tone'], { color: string; bg: string }> = {
  info: { color: 'var(--blue-light)', bg: 'rgba(21,118,212,0.14)' },
  warning: { color: '#a16207', bg: 'rgba(245,158,11,0.18)' },
  danger: { color: '#dc2626', bg: 'rgba(224,82,82,0.14)' },
  success: { color: '#16a34a', bg: 'rgba(34,201,138,0.14)' },
}

export default function AccountHubCard({
  href,
  title,
  description,
  icon,
  badge,
  disabled = false,
}: AccountHubCardProps) {
  const inner = (
    <>
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: 'rgba(21,118,212,0.12)',
          color: 'var(--blue-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {title}
          </h3>
          {badge && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: BADGE_STYLES[badge.tone].bg,
                color: BADGE_STYLES[badge.tone].color,
                lineHeight: 1,
              }}
            >
              {badge.text}
            </span>
          )}
        </div>
        <p
          style={{
            margin: '0.3rem 0 0',
            fontSize: '0.8rem',
            color: 'var(--text-second)',
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>

      <span
        aria-hidden
        style={{
          color: 'var(--text-faint)',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </span>
    </>
  )

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '1rem 1.125rem',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    textDecoration: 'none',
    transition: 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
  }

  if (disabled) {
    return (
      <div className="account-hub-card" style={baseStyle} aria-disabled>
        {inner}
      </div>
    )
  }

  return (
    <Link href={href} className="account-hub-card" style={baseStyle}>
      {inner}
    </Link>
  )
}
