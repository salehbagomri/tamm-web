'use client'

import { useEffect } from 'react'
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from '@/lib/constants/support'

interface Props {
  isOpen: boolean
  onClose: () => void
  orderNumber: string
}

export default function SupportModal({ isOpen, onClose, orderNumber }: Props) {
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const waText = encodeURIComponent(`مرحباً، أحتاج مساعدة بخصوص طلب رقم ${orderNumber}`)

  return (
    <>
      <style>{`
        @keyframes supportSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .support-sheet { animation: supportSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }
        .support-option:hover { background: var(--bg-surface2) !important; }
        .support-close-btn:hover { background: var(--bg-surface2) !important; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)' }}
      />

      {/* Sheet */}
      <div className="support-sheet" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '24px 24px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0.75rem 1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            backgroundColor: 'rgba(21,118,212,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--blue-primary)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.125rem' }}>
              تواصل مع الدعم الفني
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-second)', margin: 0 }}>
              فريقنا جاهز لمساعدتك
            </p>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

        {/* Option 1: Call */}
        <a
          href={`tel:${SUPPORT_PHONE}`}
          className="support-option"
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.5rem', textDecoration: 'none',
            transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            backgroundColor: 'rgba(34,197,94,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.47 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', margin: '0 0 0.125rem' }}>اتصال مباشر</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-second)', margin: 0 }}>{SUPPORT_PHONE}</p>
          </div>
        </a>

        {/* Option 2: WhatsApp */}
        <a
          href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="support-option"
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.5rem', textDecoration: 'none',
            transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            backgroundColor: 'rgba(37,211,102,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', margin: '0 0 0.125rem' }}>واتساب</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-second)', margin: 0 }}>تواصل عبر واتساب</p>
          </div>
        </a>

        {/* Close button */}
        <div style={{ padding: '0.75rem 1.5rem 1rem' }}>
          <button
            onClick={onClose}
            className="support-close-btn"
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '12px',
              border: '1px solid var(--border)', backgroundColor: 'transparent',
              color: 'var(--text-second)', fontSize: '0.9375rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </>
  )
}
