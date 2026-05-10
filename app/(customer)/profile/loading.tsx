export default function ProfileLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* يسار */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '2rem', backgroundColor: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%' }} className="skeleton" />
          <div style={{ width: '140px', height: '24px', borderRadius: '8px' }} className="skeleton" />
          <div style={{ width: '180px', height: '16px', borderRadius: '6px' }} className="skeleton" />
          <div style={{ width: '80px', height: '28px', borderRadius: '999px' }} className="skeleton" />
        </div>

        {/* يمين */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: '100px', borderRadius: '16px' }} className="skeleton" />
            ))}
          </div>
          {/* Form */}
          <div style={{ height: '300px', borderRadius: '16px' }} className="skeleton" />
        </div>
      </div>
    </div>
  )
}
