import type { Order } from '@/lib/types/order'

const STEPS = [
  { key: 'pending', label: 'معلق' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'assigned', label: 'تم التعيين' },
  { key: 'on_the_way', label: 'في الطريق' },
  { key: 'in_progress', label: 'جاري التنفيذ' },
  { key: 'completed', label: 'مكتمل' },
]

export default function OrderStatusTracker({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div style={{ padding: '1.5rem', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: '16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--error)', fontWeight: 700, margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          هذا الطلب ملغي
        </p>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex(s => s.key === status)
  
  return (
    <div className="status-tracker-container" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
      <div className="status-tracker-track" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {/* Background Line */}
        <div className="status-tracker-line-bg" style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }} />
        
        {/* Progress Line */}
        {currentIndex > 0 && (
          <div className="status-tracker-line-progress" style={{ position: 'absolute', top: '24px', right: '40px', left: `${100 - (currentIndex / (STEPS.length - 1)) * 100}%`, height: '2px', backgroundColor: 'var(--success)', zIndex: 1, transition: 'all 0.5s' }} />
        )}

        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <div key={step.key} className="status-tracker-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 2, flex: 1 }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isCompleted ? 'var(--success)' : isCurrent ? 'rgba(21,118,212,0.1)' : 'var(--bg-surface)',
                border: `2px solid ${isCompleted ? 'var(--success)' : isCurrent ? 'var(--blue-primary)' : 'var(--border)'}`,
                color: isCompleted ? '#fff' : isCurrent ? 'var(--blue-light)' : 'var(--text-faint)',
                fontWeight: 700, fontSize: '1.25rem',
                boxShadow: isCurrent ? '0 0 0 4px rgba(21,118,212,0.2)' : 'none',
              }}>
                {isCompleted ? '✓' : (i + 1)}
              </div>
              <span style={{
                fontSize: '0.875rem', fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? 'var(--text-primary)' : isCompleted ? 'var(--text-second)' : 'var(--text-faint)',
                textAlign: 'center', whiteSpace: 'nowrap'
              }}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html:`
        @media (max-width: 640px) {
          .status-tracker-track {
            flex-direction: column !important;
            gap: 1.5rem !important;
            padding-right: 1.5rem;
          }
          .status-tracker-line-bg {
            top: 24px !important;
            bottom: 24px !important;
            right: 39px !important; /* Center of 48px circle + 1.5rem padding */
            width: 2px !important;
            height: auto !important;
            left: auto !important;
          }
          .status-tracker-line-progress {
            top: 24px !important;
            right: 39px !important;
            width: 2px !important;
            bottom: ${100 - (currentIndex / (STEPS.length - 1)) * 100}% !important;
            height: auto !important;
            left: auto !important;
          }
          .status-tracker-step {
            flex-direction: row !important;
            width: 100%;
          }
        }
      `}} />
    </div>
  )
}
