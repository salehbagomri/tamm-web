'use client'

import { useState } from 'react'
import { submitReview } from '@/lib/actions/reviews'
import type { Review } from '@/lib/data/reviews'

interface Props {
  orderId: string
  technicianId: string | null
  existingReview: Review | null
  orderStatus: string
}

function StarIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  }
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function SmallStar({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

export default function ReviewCard({ orderId, technicianId, existingReview, orderStatus }: Props) {
  const [submitted, setSubmitted] = useState(!!existingReview)
  const [review, setReview] = useState<Review | null>(existingReview)
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (orderStatus !== 'completed') return null

  async function handleSubmit() {
    if (!selected) return
    setLoading(true)
    setError('')
    const result = await submitReview(orderId, technicianId, selected, comment.trim() || null)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? 'حدث خطأ غير متوقع')
      return
    }
    setReview({
      id: '',
      orderId,
      customerId: '',
      technicianId,
      rating: selected,
      comment: comment.trim() || null,
      createdAt: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  const activeStars = hovered || selected

  return (
    <>
      <style>{`
        @keyframes reviewFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .review-card-inner {
          animation: reviewFadeIn 0.3s ease both;
        }
        .review-star-btn {
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          color: var(--text-faint);
          transition: transform 0.15s ease, color 0.15s ease;
          line-height: 0;
        }
        .review-star-btn:hover { transform: scale(1.15); }
        .review-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-family: inherit;
          font-size: 0.9rem;
          color: var(--text-primary);
          background: var(--bg-surface2);
          resize: none;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          direction: rtl;
        }
        .review-textarea:focus { border-color: var(--blue-primary); }
        .review-submit-btn {
          padding: 0.625rem 1.75rem;
          border-radius: 10px;
          border: none;
          background: var(--blue-primary);
          color: #fff;
          font-family: inherit;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .review-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        overflow: 'hidden',
      }}>
        {!submitted ? (
          <div className="review-card-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                كيف كانت تجربتك؟
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-second)' }}>
                ساعدنا بتقييم الخدمة لتحسين تجربتك
              </p>
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="review-star-btn"
                  style={{ color: n <= activeStars ? '#f59e0b' : 'var(--text-faint)' }}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(n)}
                  aria-label={`${n} نجوم`}
                >
                  <StarIcon filled={n <= activeStars} />
                </button>
              ))}
            </div>

            {/* Comment textarea — shown after star selected */}
            <div style={{
              maxHeight: selected ? '160px' : '0px',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
            }}>
              <textarea
                className="review-textarea"
                rows={3}
                placeholder="أخبرنا عن تجربتك (اختياري)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--error)' }}>{error}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="review-submit-btn"
                disabled={!selected || loading}
                onClick={handleSubmit}
              >
                {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </div>
          </div>
        ) : (
          <div className="review-card-inner" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Success header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                شكراً على تقييمك! 🌟
              </p>
            </div>

            {/* Stars row */}
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <SmallStar key={n} filled={n <= (review?.rating ?? 0)} />
              ))}
            </div>

            {/* Comment */}
            {review?.comment && (
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-second)', lineHeight: 1.6 }}>
                {review.comment}
              </p>
            )}

            {/* Date */}
            {review?.createdAt && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                {new Date(review.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
