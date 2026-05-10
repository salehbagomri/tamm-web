import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '5rem 1.5rem 4rem',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--blue-dark) 60%, var(--bg-primary) 100%)',
      }}
    >
      {/* خلفية ديكورية */}
      <div style={{
        position: 'absolute', top: '-120px', left: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(21,118,212,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', right: '10%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(62,158,245,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}>
          {/* النص الرئيسي */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 1rem', marginBottom: '1.5rem',
              backgroundColor: 'rgba(21,118,212,0.15)',
              border: '1px solid rgba(21,118,212,0.3)',
              borderRadius: '999px', fontSize: '0.875rem',
              color: 'var(--blue-light)',
            }}>
              <span>✦</span>
              <span>خدمات التكييف والطاقة الشمسية</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 700, lineHeight: 1.2,
              color: 'var(--text-primary)', marginBottom: '1.25rem',
            }}>
              اجعل بيتك{' '}
              <span style={{
                background: 'linear-gradient(90deg, var(--blue-light), var(--blue-sky))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                مريحاً وموفراً
              </span>
              {' '}للطاقة
            </h1>

            <p style={{
              fontSize: '1.0625rem', color: 'var(--text-second)',
              lineHeight: 1.75, marginBottom: '2rem', maxWidth: '480px',
            }}>
              منصة تمّ تجمع لك أفضل خدمات التكييف والطاقة الشمسية — من التركيب
              والصيانة حتى توريد المنتجات بضمان وأسعار شفافة.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/store" style={{
                padding: '0.875rem 2rem', borderRadius: '12px', fontWeight: 700,
                fontSize: '1rem', textDecoration: 'none',
                background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                color: '#fff', boxShadow: '0 8px 24px rgba(21,118,212,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                تصفح المتجر
              </Link>
              <Link href="/services" style={{
                padding: '0.875rem 2rem', borderRadius: '12px', fontWeight: 700,
                fontSize: '1rem', textDecoration: 'none',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                transition: 'background-color 0.2s',
              }}>
                احجز خدمة
              </Link>
            </div>

            {/* إحصائيات */}
            <div style={{
              display: 'flex', gap: '2rem', marginTop: '2.5rem',
              paddingTop: '2rem', borderTop: '1px solid var(--border)',
              flexWrap: 'wrap',
            }}>
              {[
                { num: '+500', label: 'عميل راضٍ' },
                { num: '+200', label: 'خدمة منجزة' },
                { num: '4.9★', label: 'تقييم العملاء' },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--blue-light)' }}>{s.num}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-faint)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration ديكورية */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}>
            <div style={{
              width: '280px', height: '280px', borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, var(--blue-primary), var(--blue-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 80px rgba(21,118,212,0.3)',
              position: 'relative',
            }}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)"/>
                <path d="M7 21h10M12 17v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 8l3 3 5-5" stroke="#8DCBFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="6" r="3" fill="#22C98A" opacity="0.8"/>
              </svg>
              {/* نقاط ديكورية */}
              {[[-40, -20], [40, -30], [-30, 40], [50, 30]].map(([x, y], i) => (
                <div key={i} style={{
                  position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
                  width: i % 2 === 0 ? '10px' : '6px', height: i % 2 === 0 ? '10px' : '6px',
                  borderRadius: '50%', backgroundColor: 'var(--blue-sky)', opacity: 0.6,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
