'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateReceiptUrl } from '@/lib/actions/orders'

interface Props {
  orderId: string
  currentReceiptUrl: string | null
  paymentType: string
}

export default function ReceiptUpload({ orderId, currentReceiptUrl }: Props) {
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

    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `receipts/${orderId}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('receipts')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      setError('فشل رفع الصورة، يرجى المحاولة مرة أخرى')
      setUploadState(receiptUrl ? 'done' : 'idle')
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(path)

    const result = await updateReceiptUrl(orderId, publicUrl)
    if (!result.success) {
      setError(result.error ?? 'حدث خطأ أثناء الحفظ')
      setUploadState(receiptUrl ? 'done' : 'idle')
      return
    }

    setReceiptUrl(publicUrl)
    setUploadState('done')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <>
      <style>{`@keyframes receiptSpin { to { transform: rotate(360deg); } }`}</style>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
            padding: '2rem',
            backgroundColor: hovering ? 'rgba(21,118,212,0.04)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.625rem',
            width: '100%',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
            إرفاق سند التحويل
          </span>
          <span style={{ color: 'var(--text-second)', fontSize: '0.8125rem' }}>
            اضغط لرفع صورة السند
          </span>
        </button>
      )}

      {uploadState === 'uploading' && (
        <div
          style={{
            border: '2px dashed var(--border)',
            borderRadius: '12px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--blue-primary)',
              animation: 'receiptSpin 0.8s linear infinite',
            }}
          />
          <span style={{ color: 'var(--text-second)', fontSize: '0.9375rem' }}>جاري الرفع...</span>
        </div>
      )}

      {uploadState === 'done' && receiptUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
            <img
              src={receiptUrl}
              alt="سند التحويل"
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                backgroundColor: 'var(--success)',
                color: '#fff', fontSize: '0.8125rem', fontWeight: 700,
                padding: '0.25rem 0.75rem', borderRadius: '20px',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              تم رفع السند
            </div>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            type="button"
            style={{
              padding: '0.625rem 1rem', borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface2)',
              color: 'var(--text-second)', fontSize: '0.875rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            استبدال الصورة
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: '0.5rem 0 0' }}>{error}</p>
      )}
    </>
  )
}
