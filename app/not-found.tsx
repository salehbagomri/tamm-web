import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#080E18', // var(--bg-primary)
      color: '#E8F0F8', // var(--text-primary)
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'var(--font-alexandria), sans-serif',
    }}>
      <div style={{
        backgroundColor: '#0D1825', // var(--bg-surface)
        border: '1px solid #1A2E44', // var(--border)
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '500px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            backgroundColor: '#1576D4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 900,
          }}>ت</div>
        </div>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#1576D4', margin: '0 0 1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#E8F0F8' }}>الصفحة غير موجودة</h2>
        <p style={{ color: '#7A96B0', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى العودة إلى الصفحة الرئيسية.
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          backgroundColor: '#1576D4', // var(--blue-primary)
          color: '#fff',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
          transition: 'background 0.2s',
        }}>
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
