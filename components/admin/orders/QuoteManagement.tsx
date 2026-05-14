'use client'

import { useState, useRef } from 'react'
import type { AdminOrderDetail } from '@/lib/data/admin/orders'
import { sendQuote, uploadQuoteAttachment } from '@/lib/actions/admin/orders'
import { formatPrice } from '@/lib/utils/format'

export default function QuoteManagement({ order }: { order: AdminOrderDetail }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [price, setPrice] = useState('')
  const [details, setDetails] = useState('')
  const [duration, setDuration] = useState('')
  const [attachUrl, setAttachUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (order.orderType !== 'quote_request') return null

  const qs = order.quoteStatus

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadQuoteAttachment(fd, order.id)
    setUploading(false)
    if (res.error) setError(res.error)
    else { setAttachUrl(res.url ?? null); setError('') }
  }

  async function handleSend() {
    if (!price || !details) { setError('يرجى إدخال السعر والتفاصيل'); return }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) { setError('يرجى إدخال سعر صحيح'); return }
    setLoading(true); setError('')
    const res = await sendQuote(order.id, {
      quotePrice: priceNum,
      quoteDetails: details,
      quoteDuration: duration,
      quoteAttachmentUrl: attachUrl,
    })
    setLoading(false)
    if (res.error) setError(res.error)
    else { setSuccess('تم إرسال عرض السعر بنجاح ✓'); setShowForm(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-surface2)',
    border: '1px solid var(--border)', borderRadius: '10px',
    color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  }
  const label: React.CSSProperties = {
    fontSize: '0.8125rem', color: 'var(--text-second)', fontWeight: 500, marginBottom: '0.375rem', display: 'block',
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        💬 إدارة عرض السعر
      </h3>

      {success && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(34,201,138,0.1)', border: '1px solid rgba(34,201,138,0.3)', color: 'var(--success)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* ── pending: نموذج إرسال العرض ── */}
      {(qs === 'pending' || showForm) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={label}>السعر المقترح (ر.س)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="مثال: 500" style={inputStyle} />
          </div>
          <div>
            <label style={label}>تفاصيل العرض</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="وصف الخدمة، ما يشمله العرض، الضمانات..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div>
            <label style={label}>المدة التقديرية (اختياري)</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="مثال: 3 أيام عمل" style={inputStyle} />
          </div>
          <div>
            <label style={label}>مرفق (PDF أو صورة — اختياري)</label>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ padding: '0.625rem 1rem', borderRadius: '10px', backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)', color: 'var(--text-second)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {uploading ? 'جاري الرفع...' : attachUrl ? '✓ تم الرفع — تغيير' : '📎 رفع مرفق'}
            </button>
            {attachUrl && <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: 'var(--success)' }}>✓ تم رفع الملف بنجاح</p>}
          </div>
          <button onClick={handleSend} disabled={loading}
            style={{ padding: '0.875rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))', color: '#fff', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'جاري الإرسال...' : '📨 إرسال عرض السعر'}
          </button>
        </div>
      )}

      {/* ── sent: في انتظار رد العميل ── */}
      {qs === 'sent' && !showForm && (
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(21,118,212,0.06)', border: '1px solid rgba(21,118,212,0.2)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 0.5rem', color: 'var(--blue-light)', fontWeight: 700 }}>📨 تم إرسال العرض</p>
          {order.quotePrice && <p style={{ margin: '0 0 0.25rem', color: 'var(--text-second)', fontSize: '0.875rem' }}>السعر: <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(order.quotePrice)}</strong></p>}
          {order.quoteDetails && <p style={{ margin: '0 0 0.25rem', color: 'var(--text-second)', fontSize: '0.875rem' }}>{order.quoteDetails}</p>}
          {order.quoteDuration && <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: '0.8rem' }}>المدة: {order.quoteDuration}</p>}
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem', color: 'var(--text-faint)' }}>في انتظار رد العميل...</p>
        </div>
      )}

      {/* ── accepted: تم القبول ── */}
      {qs === 'accepted' && (
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(34,201,138,0.08)', border: '1px solid rgba(34,201,138,0.25)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 0.375rem', color: 'var(--success)', fontWeight: 700 }}>✅ قبل العميل العرض</p>
          {order.quoteRespondedAt && <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: '0.8rem' }}>{new Date(order.quoteRespondedAt).toLocaleString('ar-SA')}</p>}
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.875rem', color: 'var(--text-second)' }}>يمكنك الآن تعيين الفني من القسم أدناه.</p>
        </div>
      )}

      {/* ── rejected: تم الرفض ── */}
      {qs === 'rejected' && !showForm && (
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.25)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 0.375rem', color: 'var(--error)', fontWeight: 700 }}>❌ رفض العميل العرض</p>
          {order.rejectionReason && <p style={{ margin: '0 0 0.75rem', color: 'var(--text-second)', fontSize: '0.875rem' }}>السبب: {order.rejectionReason}</p>}
          <button onClick={() => { setShowForm(true); setSuccess('') }}
            style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', backgroundColor: 'rgba(21,118,212,0.1)', border: '1px solid rgba(21,118,212,0.25)', color: 'var(--blue-light)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            إرسال عرض جديد
          </button>
        </div>
      )}
    </div>
  )
}
