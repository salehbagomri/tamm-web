'use client'

import { useState } from 'react'
import type { Order } from '@/lib/types/order'
import SupportModal from './SupportModal'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:     { label: 'قيد المراجعة',      bg: 'rgba(245,158,11,0.12)', color: '#b45309' },
  confirmed:   { label: 'تم التأكيد',         bg: 'rgba(21,118,212,0.12)', color: 'var(--blue-primary)' },
  assigned:    { label: 'تم تعيين الفني',     bg: 'rgba(21,118,212,0.12)', color: 'var(--blue-primary)' },
  on_the_way:  { label: 'الفني في الطريق',    bg: 'rgba(21,118,212,0.15)', color: 'var(--blue-light)' },
  in_progress: { label: 'جاري التنفيذ',       bg: 'rgba(21,118,212,0.18)', color: 'var(--blue-primary)' },
  completed:   { label: 'مكتمل',               bg: 'rgba(34,197,94,0.12)',  color: 'var(--success)' },
  cancelled:   { label: 'ملغي',                bg: 'rgba(224,82,82,0.12)',  color: 'var(--error)' },
}

export default function OrderDetailHeader({ order }: { order: Order }) {
  const [copied, setCopied] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const conf = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const date = new Date(order.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  function handleCopy() {
    navigator.clipboard.writeText(order.orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div style={{
        backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '1.5rem',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          {/* Order number + copy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              {order.orderNumber}
            </h2>
            <button
              onClick={handleCopy}
              title="نسخ رقم الطلب"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                color: copied ? 'var(--success)' : 'var(--text-faint)',
                display: 'flex', alignItems: 'center', transition: 'color 0.2s',
              }}
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
            </button>
          </div>
          <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', margin: 0 }}>{date}</p>
        </div>

        {/* Right side: status badge + support icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.375rem 0.875rem', borderRadius: '20px',
            backgroundColor: conf.bg, color: conf.color,
            fontSize: '0.875rem', fontWeight: 700,
          }}>
            {conf.label}
          </div>
          <button
            onClick={() => setSupportOpen(true)}
            title="الدعم الفني"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '8px',
              color: 'var(--blue-primary)',
              display: 'flex', alignItems: 'center',
              transition: 'background 0.15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
          </button>
        </div>
      </div>

      <SupportModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        orderNumber={order.orderNumber}
      />
    </>
  )
}
