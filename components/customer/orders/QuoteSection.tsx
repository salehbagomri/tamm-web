'use client'

import { useState } from 'react'
import type { Order } from '@/lib/types/order'
import { respondToQuote } from '@/lib/actions/orders'

export default function QuoteSection({ order }: { order: Order }) {
  const [loadingAction, setLoadingAction] = useState<'accepted' | 'rejected' | null>(null)
  const [error, setError] = useState('')

  if (order.orderType !== 'quote_request') return null

  async function handleRespond(response: 'accepted' | 'rejected') {
    setLoadingAction(response)
    setError('')
    const result = await respondToQuote(order.id, response)
    if (result.error) {
      setError(result.error)
      setLoadingAction(null)
    }
    // if success, revalidatePath will refresh the data
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>
        عرض السعر
      </h3>

      {order.quoteStatus === 'pending' && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: 'rgba(245,166,35,0.05)', borderRadius: '12px', border: '1px solid rgba(245,166,35,0.2)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
          <p style={{ color: 'var(--warning)', fontWeight: 600, margin: '0 0 0.5rem' }}>جاري مراجعة طلبك</p>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9375rem', margin: 0 }}>سنرسل لك عرض السعر في أقرب وقت ممكن.</p>
        </div>
      )}

      {order.quoteStatus === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-second)', margin: '0 0 0.5rem' }}>السعر المقترح</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--blue-light)', margin: '0 0 1rem' }}>
              {order.quotePrice?.toLocaleString('ar-SA') ?? '—'} ر.س
            </p>
            
            {order.quoteDetails && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-second)', margin: '0 0 0.25rem' }}>التفاصيل</p>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{order.quoteDetails}</p>
              </div>
            )}
            
            {order.quoteDuration && (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-second)', margin: '0 0 0.25rem' }}>المدة التقديرية</p>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0 }}>{order.quoteDuration}</p>
              </div>
            )}
            
            {order.quoteSentAt && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '1rem 0 0' }}>
                تاريخ العرض: {new Date(order.quoteSentAt).toLocaleDateString('ar-SA')}
              </p>
            )}
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleRespond('accepted')} disabled={loadingAction !== null} style={{
              flex: 1, padding: '0.875rem', borderRadius: '10px',
              backgroundColor: 'rgba(34,201,138,0.1)', border: '1px solid var(--success)',
              color: 'var(--success)', fontWeight: 700, cursor: loadingAction ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: '0.9375rem', transition: 'all 0.2s'
            }}>
              {loadingAction === 'accepted' ? 'جاري القبول...' : '✓ قبول العرض'}
            </button>
            <button onClick={() => handleRespond('rejected')} disabled={loadingAction !== null} style={{
              flex: 1, padding: '0.875rem', borderRadius: '10px',
              backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid var(--error)',
              color: 'var(--error)', fontWeight: 700, cursor: loadingAction ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: '0.9375rem', transition: 'all 0.2s'
            }}>
              {loadingAction === 'rejected' ? 'جاري الرفض...' : '✕ رفض العرض'}
            </button>
          </div>
        </div>
      )}

      {order.quoteStatus === 'accepted' && (
        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'rgba(34,201,138,0.05)', borderRadius: '12px', border: '1px solid rgba(34,201,138,0.2)' }}>
          <p style={{ color: 'var(--success)', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1.125rem' }}>✓ تم قبول العرض</p>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9375rem', margin: 0 }}>
            {order.quoteRespondedAt ? `بتاريخ ${new Date(order.quoteRespondedAt).toLocaleDateString('ar-SA')}` : ''}
          </p>
        </div>
      )}

      {order.quoteStatus === 'rejected' && (
        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'rgba(224,82,82,0.05)', borderRadius: '12px', border: '1px solid rgba(224,82,82,0.2)' }}>
          <p style={{ color: 'var(--error)', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1.125rem' }}>✕ تم رفض العرض</p>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9375rem', margin: '0 0 0.5rem' }}>بانتظار عرض جديد من الإدارة.</p>
          {order.quoteRespondedAt && (
            <p style={{ color: 'var(--text-faint)', fontSize: '0.8125rem', margin: 0 }}>
              بتاريخ {new Date(order.quoteRespondedAt).toLocaleDateString('ar-SA')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
