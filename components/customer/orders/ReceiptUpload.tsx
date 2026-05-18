'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateReceiptUrl } from '@/lib/actions/orders'

interface Props {
  orderId: string
  orderNumber: string
  currentReceiptUrl: string | null
  paymentType: string
}

export default function ReceiptUpload({ orderId, orderNumber, currentReceiptUrl }: Props) {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done'>(
    currentReceiptUrl ? 'done' : 'idle'
  )
  const [receiptUrl, setReceiptUrl] = useState<string | null>(currentReceiptUrl)
  const [error, setError] = useState('')
  const [hovering, setHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploadState('uploading')
    setError('')

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${orderId}/${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('receipts')
        .upload(path, file, { upsert: true })

      if (uploadErr) {
        setError(`فشل رفع الملف: ${uploadErr.message}`)
        setUploadState(receiptUrl ? 'done' : 'idle')
        return
      }

      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      const result = await updateReceiptUrl(orderId, publicUrl)

      if (!result.success) {
        setError(result.error ?? 'حدث خطأ أثناء الحفظ')
        setUploadState(receiptUrl ? 'done' : 'idle')
        return
      }

      setReceiptUrl(publicUrl)
      setUploadState('done')
    } catch (err) {
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى')
      setUploadState(receiptUrl ? 'done' : 'idle')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const isPdf = receiptUrl?.toLowerCase().includes('.pdf')

  return (
    <>
      <style>{`@keyframes receiptSpin { to { transform: rotate(360deg); } }`}</style>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {uploadState === 'idle' && (
        <button
          onClick={() => inputRef.current?.click()}
          type="button"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            border: `2px dashed ${hovering ? 'var(--blue-primary)' : 'var(--border)'}`,
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            backgroundColor: hovering ? 'rgba(21,118,212,0.04)' : 'transparent',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem',
            width: '100%', fontFamily: 'inherit',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
            إرفاق سند التحويل
          </span>
          <span style={{ color: 'var(--text-second)', fontSize: '0.8125rem' }}>
            اضغط لرفع صورة أو ملف PDF
          </span>
        </button>
      )}

      {uploadState === 'uploading' && (
        <div style={{
          border: '2px dashed var(--border)', borderRadius: '12px', padding: '2rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '3px solid var(--border)', borderTopColor: 'var(--blue-primary)',
            animation: 'receiptSpin 0.8s linear infinite',
          }}/>
          <span style={{ color: 'var(--text-second)', fontSize: '0.9375rem' }}>جاري الرفع...</span>
        </div>
      )}

      {uploadState === 'done' && receiptUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Preview */}
          {isPdf ? (
            <div style={{
              borderRadius: '12px', overflow: 'hidden',
              backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
              padding: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.875rem',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                backgroundColor: 'rgba(224,82,82,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--error)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.125rem', fontSize: '0.9375rem' }}>ملف PDF</p>
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--blue-light)', textDecoration: 'none' }}>
                  فتح الملف ↗
                </a>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
              <img
                src={receiptUrl}
                alt="سند التحويل"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* Success card */}
          <div style={{
            backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '12px', padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              backgroundColor: 'var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--success)', margin: '0 0 0.125rem', fontSize: '0.9375rem' }}>
                تم إرفاق السند بنجاح ✓
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-second)', margin: 0 }}>
                سيتم مراجعته من قبل الفريق
              </p>
            </div>
          </div>

          {/* Replace button */}
          <button
            onClick={() => inputRef.current?.click()}
            type="button"
            style={{
              padding: '0.5rem 1rem', borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-second)', fontSize: '0.8125rem',
              cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start',
            }}
          >
            استبدال السند
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: '0.5rem 0 0' }}>{error}</p>
      )}
    </>
  )
}
