'use client'

import { useState } from 'react'

interface Props {
  orderId: string
  orderNumber: string
  paymentType: 'cash' | 'bank' | 'wallet'
  onContinueShopping: () => void
  onViewOrder: () => void
}

export default function OrderSuccessModal({ orderNumber, paymentType, onContinueShopping, onViewOrder }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        @keyframes successOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes successCardIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          animation: 'successOverlayIn 0.25s ease',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '420px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            animation: 'successCardIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Success icon */}
          <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '0.25rem' }}>
            {[
              { top: '-8px', right: '-8px' },
              { top: '-8px', left: '-8px' },
              { bottom: '-8px', right: '-8px' },
              { bottom: '-8px', left: '-8px' },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', width: '8px', height: '8px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                  opacity: 0.5,
                  ...pos,
                }}
              />
            ))}
            <div
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', margin: 0 }}>
            شكراً لك على الشراء! 🎉
          </h2>

          {/* Order number row */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%',
              backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', padding: '0.75rem 1rem',
            }}
          >
            <span style={{ color: 'var(--text-second)', fontSize: '0.875rem' }}>رقم طلبك</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--blue-primary)', fontWeight: 700 }}>{orderNumber}</span>
              <button
                onClick={handleCopy}
                title="نسخ رقم الطلب"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                  color: copied ? 'var(--success)' : 'var(--text-faint)',
                  display: 'flex', alignItems: 'center', transition: 'color 0.2s',
                }}
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Subtitle */}
          <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
            يمكنك متابعة حالة طلبك من خلال صفحة طلباتي
          </p>

          {/* Payment transfer warning */}
          {(paymentType === 'bank' || paymentType === 'wallet') && (
            <div
              style={{
                width: '100%',
                background: 'color-mix(in srgb, #f59e0b 10%, transparent)',
                border: '1px solid #f59e0b40',
                borderRadius: '12px', padding: '0.75rem',
                display: 'flex', gap: '0.625rem', alignItems: 'flex-start',
              }}
            >
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: '1px' }}
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p style={{ margin: 0, color: '#b45309', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                يرجى إرفاق صورة من سند التحويل في صفحة تفاصيل الطلب
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <button
              onClick={onContinueShopping}
              style={{
                width: '100%', padding: '0.875rem',
                background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              مواصلة التسوق 🛍
            </button>
            <button
              onClick={onViewOrder}
              style={{
                width: '100%', padding: '0.875rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem',
                borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              عرض الطلب ←
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
