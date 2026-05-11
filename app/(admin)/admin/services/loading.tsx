function Skel({ w = '100%', h = '1rem', r = '6px' }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width: w, height: h, borderRadius: r, backgroundColor: 'var(--bg-surface2)', animation: 'sk 1.5s ease-in-out infinite' }} />
}
export default function ServicesLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skel w="160px" h="1.75rem" r="8px" />
          <Skel w="90px" h="0.875rem" />
        </div>
        <Skel w="130px" h="2.5rem" r="12px" />
      </div>
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface2)', display: 'flex', gap: '1rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <Skel key={i} w="80px" h="0.8rem" />)}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Skel w="130px" h="0.875rem" />
              <Skel w="80px" h="0.75rem" />
            </div>
            <Skel w="80px" h="1.5rem" r="999px" />
            <Skel w="80px" h="0.875rem" />
            <Skel w="60px" h="1.5rem" r="999px" />
            <Skel w="44px" h="24px" r="999px" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Skel w="55px" h="1.75rem" r="8px" />
              <Skel w="45px" h="1.75rem" r="8px" />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}
