function Skel({ w = '100%', h = '1rem', r = '6px' }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width: w, height: h, borderRadius: r, backgroundColor: 'var(--bg-surface2)', animation: 'sk 1.5s ease-in-out infinite' }} />
}
export default function TechniciansLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <Skel w="160px" h="1.75rem" r="8px" />
        <div style={{ marginTop: '0.5rem' }}><Skel w="140px" h="0.875rem" /></div>
      </div>
      {/* Add Form Skeleton */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <Skel w="160px" h="1rem" />
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <Skel w="100%" h="2.75rem" r="10px" />
          <Skel w="100px" h="2.75rem" r="10px" />
        </div>
      </div>
      {/* Table Skeleton */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface2)', display: 'flex', gap: '2rem' }}>
          {Array.from({ length: 5 }).map((_, i) => <Skel key={i} w="80px" h="0.8rem" />)}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 2 }}>
              <Skel w="40px" h="40px" r="50%" />
              <Skel w="100px" h="0.875rem" />
            </div>
            <Skel w="100px" h="0.875rem" />
            <Skel w="140px" h="0.875rem" />
            <Skel w="30px" h="1.5rem" r="999px" />
            <Skel w="44px" h="24px" r="999px" />
            <Skel w="55px" h="1.75rem" r="8px" />
          </div>
        ))}
      </div>
      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}
