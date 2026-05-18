'use client'

const STAGES = [
  { status: 'pending',     label: 'تم استلام الطلب',  icon: 'receipt'  },
  { status: 'confirmed',   label: 'تم التأكيد',        icon: 'check'    },
  { status: 'assigned',    label: 'تم تعيين الفني',    icon: 'engineer' },
  { status: 'on_the_way',  label: 'الفني في الطريق',   icon: 'car'      },
  { status: 'in_progress', label: 'جاري التنفيذ',      icon: 'build'    },
  { status: 'completed',   label: 'مكتمل',              icon: 'done'     },
]

const ICONS: Record<string, React.ReactNode> = {
  receipt: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  check: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  engineer: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  car: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  build: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  done: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
}

const CHECK_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div style={{
        backgroundColor: 'rgba(224,82,82,0.06)', border: '1px solid rgba(224,82,82,0.25)',
        borderRadius: '16px', padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          backgroundColor: 'var(--error)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <span style={{ color: 'var(--error)', fontWeight: 700, fontSize: '1rem' }}>تم الإلغاء ✕</span>
      </div>
    )
  }

  const currentIndex = STAGES.findIndex(s => s.status === status)

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
      <style>{`
        @keyframes tlPulse {
          0%   { box-shadow: 0 0 0 0px  rgba(21,118,212,0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(21,118,212,0);   }
          100% { box-shadow: 0 0 0 0px  rgba(21,118,212,0);   }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex
          const isCurrent   = i === currentIndex
          const isLast      = i === STAGES.length - 1

          return (
            <div key={stage.status} style={{ position: 'relative', paddingBottom: isLast ? 0 : '1.625rem' }}>
              {/* Vertical connector — right:17px centers on the 36px circle (RTL: first child is on the right) */}
              {!isLast && (
                <div style={{
                  position: 'absolute',
                  right: '17px', top: '36px', bottom: 0,
                  width: '2px',
                  backgroundColor: isCompleted ? 'var(--success)' : 'var(--border)',
                }}/>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Circle */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isCompleted || isCurrent ? 'var(--blue-primary)' : 'transparent',
                  border: `2px solid ${isCompleted || isCurrent ? 'var(--blue-primary)' : 'var(--border)'}`,
                  color: isCompleted || isCurrent ? 'white' : 'var(--text-faint)',
                  animation: isCurrent ? 'tlPulse 2s infinite' : 'none',
                }}>
                  {isCompleted ? CHECK_ICON : ICONS[stage.icon]}
                </div>

                {/* Label */}
                <span style={{
                  fontSize: '0.9375rem',
                  fontWeight: isCurrent ? 700 : 400,
                  color: isCurrent
                    ? 'var(--text-primary)'
                    : isCompleted
                    ? 'var(--text-second)'
                    : 'var(--text-faint)',
                }}>
                  {stage.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
