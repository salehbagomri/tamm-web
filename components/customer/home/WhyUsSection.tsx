const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: 'فنيون معتمدون',
    desc: 'فريق من الفنيين المدربين والمعتمدين لضمان أفضل جودة',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'ضمان على الخدمة',
    desc: 'ضمان لمدة 6 أشهر على جميع الخدمات المقدمة',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'أسعار شفافة',
    desc: 'لا رسوم خفية — تعرف على السعر قبل الموافقة',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'خدمة سريعة',
    desc: 'نصل إليك في أسرع وقت ممكن في نفس اليوم',
  },
]

export default function WhyUsSection() {
  return (
    <section style={{ padding: '3rem 1.5rem', backgroundColor: 'var(--bg-surface2)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            لماذا تمّ؟
          </h2>
          <p style={{ color: 'var(--text-second)', maxWidth: '480px', margin: '0 auto' }}>
            نلتزم بتقديم خدمة استثنائية في كل مرة
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px', padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '0.875rem',
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(21,118,212,0.15), rgba(62,158,245,0.08))',
                border: '1px solid rgba(21,118,212,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--blue-light)',
              }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.375rem' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-second)', margin: 0, lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
