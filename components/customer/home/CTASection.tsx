import Link from 'next/link'

export default function CTASection() {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-mid) 100%)',
          borderRadius: '20px', padding: '3rem 2rem',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(62,158,245,0.2)',
        }}>
          {/* ديكور */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(21,118,212,0.2)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-40px',
            width: '150px', height: '150px', borderRadius: '50%',
            background: 'rgba(62,158,245,0.15)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700, color: '#fff', marginBottom: '1rem',
            }}>
              جاهز للبدء؟
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.75)', fontSize: '1rem',
              maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.7,
            }}>
              احجز خدمتك الآن واحصل على أفضل عناية لمنزلك من فنيين معتمدين
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/services" style={{
                padding: '0.875rem 2.5rem', borderRadius: '12px',
                fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                backgroundColor: '#fff', color: 'var(--blue-primary)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}>
                اطلب الآن
              </Link>
              <Link href="/store" style={{
                padding: '0.875rem 2rem', borderRadius: '12px',
                fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
              }}>
                تصفح المتجر
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
