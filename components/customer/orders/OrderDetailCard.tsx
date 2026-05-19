'use client'

import { useState } from 'react'
import type { Order } from '@/lib/types/order'
import ReceiptUpload from './ReceiptUpload'

const ICON_CASH = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M6 12h.01M18 12h.01"/>
  </svg>
)
const ICON_BANK = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/>
  </svg>
)
const ICON_WALLET = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    <circle cx="17" cy="13" r="1"/>
  </svg>
)
const ICON_LOCATION = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const ICON_CALENDAR = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        backgroundColor: 'var(--bg-surface2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-second)',
      }}>
        {icon}
      </div>
      <div style={{ paddingTop: '0.125rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0 0 0.125rem' }}>{label}</p>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  )
}

export default function OrderDetailCard({ order }: { order: Order }) {
  const [copiedAccount, setCopiedAccount] = useState(false)

  function copyAccount(text: string) {
    navigator.clipboard.writeText(text)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const hasDelivery = order.address || order.city || order.preferredDate || order.preferredTimeSlot

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── معلومات التوصيل ── */}
      {hasDelivery && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>معلومات التوصيل</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {(order.address || order.city) && (
              <InfoRow
                icon={ICON_LOCATION}
                label="العنوان"
                value={[order.city, order.address].filter(Boolean).join(' — ')}
              />
            )}
            {(order.preferredDate || order.preferredTimeSlot) && (
              <InfoRow
                icon={ICON_CALENDAR}
                label="الموعد المفضل"
                value={[order.preferredDate, order.preferredTimeSlot ? `(${order.preferredTimeSlot})` : ''].filter(Boolean).join(' ')}
              />
            )}
          </div>
        </div>
      )}

      {/* ── طريقة الدفع ── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>طريقة الدفع</h3>

        {order.paymentType === 'cash' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {ICON_CASH}
              <span>💵 كاش عند الاستلام</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.3rem 0.75rem', borderRadius: '20px',
              backgroundColor: 'rgba(34,197,94,0.12)', color: 'var(--success)',
              fontSize: '0.8125rem', fontWeight: 700,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              لا يلزم تحويل
            </div>
          </div>
        )}

        {(order.paymentType === 'bank' || order.paymentType === 'wallet') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
              {order.paymentType === 'bank' ? ICON_BANK : ICON_WALLET}
              <span>{order.paymentMethodName ?? (order.paymentType === 'bank' ? 'بنك أو صراف' : 'محفظة إلكترونية')}</span>
            </div>

            {/* Account number + copy */}
            {order.paymentMethodAccountNumber && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.75rem 1rem',
              }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0 0 0.125rem' }}>رقم الحساب</p>
                  <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0, letterSpacing: '0.05em', direction: 'ltr', textAlign: 'right' }}>
                    {order.paymentMethodAccountNumber}
                  </p>
                </div>
                <button
                  onClick={() => copyAccount(order.paymentMethodAccountNumber!)}
                  title="نسخ رقم الحساب"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                    color: copiedAccount ? 'var(--success)' : 'var(--text-faint)',
                    display: 'flex', alignItems: 'center', transition: 'color 0.2s',
                    flexShrink: 0,
                  }}
                >
                  {copiedAccount ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Transfer note */}
            <p style={{
              fontSize: '0.8125rem', color: 'var(--text-second)', margin: 0,
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              يرجى التحويل لهذا الرقم وإرفاق السند
            </p>
          </div>
        )}
      </div>

      {/* ── إرفاق سند التحويل ── */}
      {(order.paymentType === 'bank' || order.paymentType === 'wallet') && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>سند التحويل</h3>
          <ReceiptUpload
            orderId={order.id}
            orderNumber={order.orderNumber}
            currentReceiptUrl={order.receiptUrl}
            paymentType={order.paymentType}
          />
        </div>
      )}

      {/* ── الملاحظات ── */}
      {order.notes && (
        <div style={{
          backgroundColor: 'rgba(21,118,212,0.04)', border: '1px solid rgba(21,118,212,0.12)',
          padding: '1.25rem 1.5rem', borderRadius: '16px',
        }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--blue-light)', margin: '0 0 0.375rem', fontWeight: 600 }}>ملاحظاتك</p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{order.notes}</p>
        </div>
      )}

    </div>
  )
}
