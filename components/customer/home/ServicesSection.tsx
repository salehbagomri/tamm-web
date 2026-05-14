import Link from 'next/link'
import type { ServiceType } from '@/lib/types/service'
import { formatPrice } from '@/lib/utils/format'

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  ac_install: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="10" rx="2"/><path d="M6 13v3m4-3v5m4-5v3M2 8h20"/></svg>,
  ac_repair:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  ac_wash:    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/><path d="M12 6v6l4 2"/></svg>,
  ac_maintenance: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  solar_install: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="9" height="7" rx="1"/><rect x="13" y="4" width="9" height="7" rx="1"/><rect x="2" y="13" width="9" height="7" rx="1"/><rect x="13" y="13" width="9" height="7" rx="1"/></svg>,
  solar_maintenance: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l1.5 4.5H18l-3.75 2.75 1.5 4.5L12 12l-3.75 2.75 1.5-4.5L6 7.5h4.5z"/></svg>,
  consultation: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

const DEFAULT_ICON = <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>

export default function ServicesSection({ services }: { services: ServiceType[] }) {
  if (services.length === 0) return null

  return (
    <section style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            خدماتنا
          </h2>
          <Link href="/services" style={{
            color: 'var(--blue-light)', fontSize: '0.9rem', fontWeight: 600,
            textDecoration: 'none',
          }}>
            عرض الكل ←
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}>
          {services.map((s) => (
            <div
              key={s.id}
              className="service-card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                backgroundColor: 'rgba(21,118,212,0.12)',
                border: '1px solid rgba(21,118,212,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--blue-light)',
              }}>
                {SERVICE_ICONS[s.iconName ?? s.category] ?? DEFAULT_ICON}
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                  {s.name}
                </h3>
                {s.description && (
                  <p style={{
                    fontSize: '0.85rem', color: 'var(--text-second)',
                    margin: 0, lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {s.description}
                  </p>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {s.isQuoteBased ? 'حسب الموقع' : formatPrice(s.basePrice)}
                </span>
                <Link href={`/services`} style={{
                  padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.8125rem',
                  fontWeight: 600, textDecoration: 'none',
                  backgroundColor: 'var(--blue-primary)', color: '#fff',
                }}>
                  احجز
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
