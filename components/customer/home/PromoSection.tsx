'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Promotion } from '@/lib/data/home'

export default function PromoSection({ promotions }: { promotions: Promotion[] }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((c) => (c + 1) % promotions.length), [promotions.length])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + promotions.length) % promotions.length), [promotions.length])

  // Auto-play كل 4 ثوانٍ
  useEffect(() => {
    if (promotions.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, promotions.length])

  if (promotions.length === 0) return null

  const promo = promotions[current]

  return (
    <section style={{ padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
          {/* البطاقة */}
          <div style={{
            background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))',
            border: '1px solid var(--blue-mid)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', minHeight: '140px',
          }}>
            <div>
              <div style={{
                display: 'inline-flex', padding: '0.25rem 0.75rem',
                backgroundColor: 'rgba(245,166,35,0.2)',
                border: '1px solid rgba(245,166,35,0.4)',
                borderRadius: '999px', marginBottom: '0.75rem',
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700 }}>
                  عرض خاص {promo.discountPercent ? `- خصم ${promo.discountPercent}%` : ''}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                {promo.title}
              </h3>
              {promo.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-second)', margin: 0 }}>
                  {promo.description}
                </p>
              )}
            </div>

            {/* نسبة الخصم */}
            {promo.discountPercent && (
              <div style={{
                minWidth: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(245,166,35,0.15)',
                border: '2px solid var(--warning)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)', lineHeight: 1 }}>
                  {promo.discountPercent}%
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--warning)', opacity: 0.8 }}>خصم</span>
              </div>
            )}
          </div>

          {/* أزرار التنقل */}
          {promotions.length > 1 && (
            <>
              <button onClick={prev} style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(13,24,37,0.7)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>›</button>
              <button onClick={next} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(13,24,37,0.7)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>‹</button>

              {/* نقاط */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '0.75rem' }}>
                {promotions.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} style={{
                    width: i === current ? '20px' : '6px', height: '6px',
                    borderRadius: '999px', border: 'none', cursor: 'pointer',
                    backgroundColor: i === current ? 'var(--blue-primary)' : 'var(--border)',
                    transition: 'width 0.3s, background-color 0.3s', padding: 0,
                  }} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
