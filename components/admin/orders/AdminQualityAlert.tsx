'use client'

import type { Review } from '@/lib/data/reviews'

interface AdminQualityAlertProps {
  review: Review | null
}

export default function AdminQualityAlert({ review }: AdminQualityAlertProps) {
  if (!review || review.rating > 3) return null

  return (
    <div style={{
      backgroundColor: 'rgba(224, 82, 82, 0.08)',
      border: '1px solid rgba(224, 82, 82, 0.3)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      animation: 'pulseBorder 2s infinite alternate',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>⚠️</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--error)' }}>
              تنبيه الجودة: تقييم العميل منخفض
            </h4>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.85rem', color: 'var(--text-second)' }}>
              يرجى مراجعة تقرير وتوثيق الفني بالأسفل لحل شكوى العميل.
            </p>
          </div>
        </div>

        {/* النجوم */}
        <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'rgba(224, 82, 82, 0.1)', padding: '0.375rem 0.75rem', borderRadius: '8px' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <svg key={n} width="16" height="16" viewBox="0 0 24 24"
              fill={n <= review.rating ? '#E05252' : 'none'}
              stroke={n <= review.rating ? '#E05252' : 'rgba(224, 82, 82, 0.3)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span style={{ marginRight: '0.5rem', fontSize: '0.8rem', color: 'var(--error)', fontWeight: 700 }}>
            {review.rating} / 5
          </span>
        </div>
      </div>

      {review.comment && (
        <div style={{
          backgroundColor: 'rgba(5, 9, 15, 0.4)',
          borderRadius: '10px',
          padding: '0.875rem 1rem',
          borderRight: '3px solid var(--error)',
        }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>تعليق وشكوى العميل:</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            « {review.comment} »
          </p>
        </div>
      )}

      <div style={{
        fontSize: '0.8rem',
        color: 'var(--text-second)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        marginTop: '0.25rem',
      }}>
        <span>💡</span>
        <span>
          يمكنك التحقق من صور التوثيق الميداني المرفوعة بواسطة الفني (قبل وبعد العمل) لمطابقة الشكوى والتواصل المباشر مع الزبون.
        </span>
      </div>

      <style>{`
        @keyframes pulseBorder {
          from { border-color: rgba(224, 82, 82, 0.3); box-shadow: 0 0 0 rgba(224, 82, 82, 0); }
          to { border-color: rgba(224, 82, 82, 0.6); box-shadow: 0 0 8px rgba(224, 82, 82, 0.15); }
        }
      `}</style>
    </div>
  )
}
