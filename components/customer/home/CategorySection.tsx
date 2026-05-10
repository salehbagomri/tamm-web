import Link from 'next/link'

const CATEGORIES = [
  {
    key: 'ac', label: 'مكيفات', icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="10" rx="2"/>
        <path d="M6 13v3m4-3v5m4-5v3m4-3v1"/>
        <path d="M2 8h20"/>
      </svg>
    ),
  },
  {
    key: 'solar_panel', label: 'ألواح شمسية', icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="9" height="7" rx="1"/>
        <rect x="13" y="4" width="9" height="7" rx="1"/>
        <rect x="2" y="13" width="9" height="7" rx="1"/>
        <rect x="13" y="13" width="9" height="7" rx="1"/>
        <path d="M12 4v16M2 10.5h20M2 13.5h20"/>
      </svg>
    ),
  },
  {
    key: 'solar_battery', label: 'بطاريات', icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="18" height="10" rx="2"/>
        <path d="M22 11v2M8 12h8M12 9v6"/>
      </svg>
    ),
  },
  {
    key: 'solar_inverter', label: 'إنفرتر', icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M9 9l3 3-3 3M15 12H9"/>
        <circle cx="17" cy="8" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: 'accessory', label: 'إكسسوارات', icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 20v2M12 2v2"/>
      </svg>
    ),
  },
]

export default function CategorySection() {
  return (
    <section style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: '1.75rem', textAlign: 'center',
        }}>
          تصفح حسب الفئة
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
        }}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/store?category=${cat.key}`}
              className="category-card"
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', padding: '1.5rem 1rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '14px', textDecoration: 'none',
                color: 'var(--text-second)', cursor: 'pointer',
              }}
            >
              <div style={{ color: 'var(--blue-light)' }}>{cat.icon}</div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
