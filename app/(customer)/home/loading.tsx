// Skeleton لصفحة الرئيسية أثناء تحميل البيانات

function Sk({ w = '100%', h = '20px', r = '8px' }: { w?: string; h?: string; r?: string }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />
}

export default function HomeLoading() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Hero Skeleton */}
      <div style={{ padding: '5rem 1.5rem 4rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Sk w="160px" h="32px" r="999px" />
            <Sk w="90%" h="56px" r="12px" />
            <Sk w="70%" h="56px" r="12px" />
            <Sk h="80px" r="12px" />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Sk w="140px" h="48px" r="12px" />
              <Sk w="120px" h="48px" r="12px" />
            </div>
          </div>
          <Sk w="280px" h="280px" r="50%" />
        </div>
      </div>

      {/* Category Skeleton */}
      <div style={{ padding: '3rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <Sk w="200px" h="32px" r="8px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '1.75rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Sk key={i} h="110px" r="14px" />
          ))}
        </div>
      </div>

      {/* Products Skeleton */}
      <div style={{ padding: '3rem 1.5rem', backgroundColor: 'var(--bg-surface2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <Sk w="200px" h="32px" />
            <Sk w="80px" h="24px" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Sk h="180px" r="14px" />
                <Sk h="20px" />
                <Sk w="60%" h="16px" />
                <Sk w="40%" h="24px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
