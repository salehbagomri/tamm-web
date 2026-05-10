import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceById } from '@/lib/data/services'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const s = await getServiceById(id)
  if (!s) return { title: 'خدمة غير موجودة | تمّ' }
  return {
    title: `${s.name} | تمّ`,
    description: s.description ?? `احجز ${s.name} من منصة تمّ`,
  }
}

const SERVICE_ICON_KEYS: Record<string, React.ReactNode> = {
  ac_install:        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="10" rx="2"/><path d="M6 13v3m4-3v5m4-5v3M2 8h20"/></svg>,
  ac_repair:         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>,
  solar_install:     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="9" height="7" rx="1"/><rect x="13" y="4" width="9" height="7" rx="1"/><rect x="2" y="13" width="9" height="7" rx="1"/><rect x="13" y="13" width="9" height="7" rx="1"/></svg>,
  consultation:      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}
const DEFAULT_ICON = <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params
  const service = await getServiceById(id)
  if (!service) notFound()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link href="/services" style={{ color: 'var(--text-second)', fontSize: '0.875rem', textDecoration: 'none' }}>الخدمات</Link>
        <span style={{ color: 'var(--text-faint)' }}>←</span>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>{service.name}</span>
      </nav>

      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))',
          padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            {SERVICE_ICON_KEYS[service.iconName ?? service.category] ?? DEFAULT_ICON}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 0.375rem' }}>
              {service.name}
            </h1>
            {service.estimatedDuration && (
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                ⏱ المدة التقديرية: {service.estimatedDuration}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {service.description && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                عن الخدمة
              </h2>
              <p style={{ color: 'var(--text-second)', lineHeight: 1.8, margin: 0 }}>{service.description}</p>
            </div>
          )}

          {/* السعر */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '12px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0 0 0.25rem' }}>السعر</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {service.isQuoteBased ? 'يُحدد حسب الموقع' : `${service.basePrice.toLocaleString('ar-SA')} ر.س`}
              </p>
            </div>
          </div>

          {/* includes */}
          {service.includes.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                ماذا يشمل؟
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {service.includes.map((inc, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: 'rgba(34,201,138,0.15)', color: 'var(--success)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>✓</span>
                    <span style={{ color: 'var(--text-second)', fontSize: '0.9375rem' }}>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* أزرار الإجراء */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href={`/services/${service.id}/book`} style={{
              flex: 1, padding: '0.875rem', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
              color: '#fff', fontWeight: 700, textDecoration: 'none',
              textAlign: 'center', boxShadow: '0 8px 24px rgba(21,118,212,0.3)',
            }}>
              {service.isQuoteBased ? '💬 طلب عرض سعر' : '📅 احجز الآن'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
