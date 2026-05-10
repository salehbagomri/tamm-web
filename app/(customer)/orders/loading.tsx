export default function OrdersLoading() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ width: '150px', height: '36px', borderRadius: '8px', marginBottom: '0.5rem' }} className="skeleton" />
      <div style={{ width: '250px', height: '20px', borderRadius: '6px', marginBottom: '2rem' }} className="skeleton" />
      
      {/* Tabs Skeleton */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: '80px', height: '36px', borderRadius: '999px' }} className="skeleton" />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: '220px', borderRadius: '16px' }} className="skeleton" />
        ))}
      </div>
    </div>
  )
}
