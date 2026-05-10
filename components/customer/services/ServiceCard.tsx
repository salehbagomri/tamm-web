import Link from 'next/link'
import type { ServiceType } from '@/lib/types/service'

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  ac_install:        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="10" rx="2"/><path d="M6 13v3m4-3v5m4-5v3M2 8h20"/></svg>,
  ac_repair:         <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  ac_wash:           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><path d="M2 12h20"/><path d="M8 20h8M12 12v8"/></svg>,
  ac_maintenance:    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  solar_install:     <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="9" height="7" rx="1"/><rect x="13" y="4" width="9" height="7" rx="1"/><rect x="2" y="13" width="9" height="7" rx="1"/><rect x="13" y="13" width="9" height="7" rx="1"/></svg>,
  solar_maintenance: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>,
  consultation:      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}
const DEFAULT_ICON = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>

export default function ServiceCard({ service }: { service: ServiceType }) {
  return (
    <div className="service-card" style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px', padding: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* الأيقونة والاسم */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
          backgroundColor: 'rgba(21,118,212,0.1)', border: '1px solid rgba(21,118,212,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--blue-light)',
        }}>
          {SERVICE_ICONS[service.iconName ?? service.category] ?? DEFAULT_ICON}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            {service.name}
          </h3>
          {service.estimatedDuration && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
              ⏱ {service.estimatedDuration}
            </span>
          )}
        </div>
      </div>

      {service.description && (
        <p style={{
          fontSize: '0.875rem', color: 'var(--text-second)',
          margin: 0, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {service.description}
        </p>
      )}

      {/* أول 3 عناصر من includes */}
      {service.includes.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {service.includes.slice(0, 3).map((inc, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-second)' }}>
              <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
              {inc}
            </li>
          ))}
          {service.includes.length > 3 && (
            <li style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>+{service.includes.length - 3} المزيد</li>
          )}
        </ul>
      )}

      {/* السعر والزر */}
      <div style={{
        marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
      }}>
        <div>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {service.isQuoteBased ? 'حسب الموقع' : `${service.basePrice.toLocaleString('ar-SA')} ر.س`}
          </span>
        </div>
        <Link href={`/services/${service.id}`} style={{
          padding: '0.5rem 1.25rem', borderRadius: '8px',
          backgroundColor: service.isQuoteBased ? 'var(--bg-surface2)' : 'var(--blue-primary)',
          border: service.isQuoteBased ? '1px solid var(--border)' : 'none',
          color: service.isQuoteBased ? 'var(--text-primary)' : '#fff',
          fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          {service.isQuoteBased ? 'طلب سعر' : 'احجز الآن'}
        </Link>
      </div>
    </div>
  )
}
