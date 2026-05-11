function Skel({ w = '100%', h = '1rem', r = '6px' }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width: w, height: h, borderRadius: r, backgroundColor: 'var(--bg-surface2)', animation: 'sk 1.5s ease-in-out infinite' }} />
}

export default function QuotesLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <Skel w="180px" h="1.75rem" r="8px" />
        <div style={{ marginTop: '0.5rem' }}><Skel w="100px" h="0.875rem" /></div>
      </div>
      <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
        <Skel w="150px" h="0.875rem" r="4px" />
        <Skel w="180px" h="2.25rem" r="10px" />
      </div>
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}><Skel w="120px" h="1rem" /></div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Skel w="80px" h="0.875rem" />
            <Skel w="120px" h="0.875rem" />
            <Skel w="70px" h="1.5rem" r="999px" />
            <Skel w="80px" h="0.875rem" />
            <Skel w="70px" h="0.875rem" />
            <Skel w="50px" h="1.75rem" r="8px" />
          </div>
        ))}
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
