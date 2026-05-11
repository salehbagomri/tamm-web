// Skeleton للداشبورد أثناء التحميل

function SkeletonBlock({
  w = '100%', h = '1rem', radius = '6px',
}: {
  w?: string; h?: string; radius?: string
}) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      backgroundColor: 'var(--bg-surface2)',
      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    }} />
  )
}

function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBlock w="60%" h="0.875rem" />
        <SkeletonBlock w="40px" h="40px" radius="10px" />
      </div>
      <SkeletonBlock w="40%" h="2rem" radius="8px" />
      <SkeletonBlock w="50%" h="0.75rem" />
    </div>
  )
}

export default function DashboardLoading() {
  const gridStyle = {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    marginBottom: '1rem',
  }

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
      {/* عنوان الصفحة */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <SkeletonBlock w="200px" h="1.75rem" radius="8px" />
        <SkeletonBlock w="140px" h="0.875rem" />
      </div>

      {/* صف البطاقات 1 */}
      <div style={gridStyle}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {/* صف البطاقات 2 */}
      <div style={gridStyle}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {/* صف البطاقات 3 */}
      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {/* صف الجدول والبطاقات الجانبية */}
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: '1fr 380px',
        marginTop: '1rem',
      }}>
        {/* جدول آخر الطلبات Skeleton */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <SkeletonBlock w="160px" h="1rem" />
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <SkeletonBlock w="80px" h="0.875rem" />
                <SkeletonBlock w="120px" h="0.875rem" />
                <SkeletonBlock w="60px" h="1.5rem" radius="999px" />
                <SkeletonBlock w="60px" h="1.5rem" radius="999px" />
                <SkeletonBlock w="60px" h="0.875rem" />
                <SkeletonBlock w="40px" h="0.875rem" />
                <SkeletonBlock w="50px" h="1.75rem" radius="8px" />
              </div>
            ))}
          </div>
        </div>

        {/* البطاقات الجانبية */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[180, 220, 200].map((h, i) => (
            <div key={i} style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.5rem',
              height: `${h}px`,
              display: 'flex', flexDirection: 'column', gap: '1rem',
            }}>
              <SkeletonBlock w="50%" h="1rem" />
              {Array.from({ length: 3 }).map((_, j) => (
                <SkeletonBlock key={j} w="100%" h="2rem" radius="8px" />
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @media (max-width: 900px) {
          .skeleton-bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
