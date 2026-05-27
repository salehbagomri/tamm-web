'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { uploadAvatar, removeAvatar } from '@/lib/actions/profile-avatar'

interface AvatarUploaderProps {
  initialUrl: string | null
  fallbackInitial: string
}

const MAX_DIM = 512
const TARGET_MIME = 'image/jpeg'
const TARGET_QUALITY = 0.85
const MAX_INPUT_BYTES = 5 * 1024 * 1024 // نقبل حتى 5 ميجا قبل الضغط
const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp'

// ضغط الصورة على client إلى 512×512 (بدون تشويه النسبة) ثم تحويلها إلى Blob
async function compressImage(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('فشل قراءة الملف'))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('فشل تحميل الصورة'))
    el.src = dataUrl
  })

  const ratio = Math.min(MAX_DIM / img.width, MAX_DIM / img.height, 1)
  const w = Math.round(img.width * ratio)
  const h = Math.round(img.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('تعذّر إنشاء canvas')
  // خلفية بيضاء حتى لا تظهر شفافية PNG كأسود
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('فشل ضغط الصورة'))),
      TARGET_MIME,
      TARGET_QUALITY,
    )
  })
}

export default function AvatarUploader({ initialUrl, fallbackInitial }: AvatarUploaderProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  // الصورة المعروضة محلياً (تعكس أحدث upload بدون انتظار refetch)
  const [displayUrl, setDisplayUrl] = useState<string | null>(initialUrl)
  // مرحلة المعاينة: المستخدم اختار صورة ولم يؤكد الرفع بعد
  const [preview, setPreview] = useState<{ blob: Blob; url: string } | null>(null)

  function resetMessages() {
    setError('')
    setSuccess('')
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    resetMessages()
    const file = e.target.files?.[0]
    e.target.value = '' // إعادة التهيئة حتى يستجيب onChange لإعادة اختيار نفس الملف
    if (!file) return

    if (file.size > MAX_INPUT_BYTES) {
      setError('الحد الأقصى للحجم 5 ميجا قبل الضغط')
      return
    }
    if (!ACCEPT.split(',').includes(file.type)) {
      setError('نوع الملف غير مسموح — JPEG أو PNG أو WebP فقط')
      return
    }

    try {
      const blob = await compressImage(file)
      const url = URL.createObjectURL(blob)
      // إفراغ معاينة سابقة إن وُجدت
      if (preview?.url) URL.revokeObjectURL(preview.url)
      setPreview({ blob, url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تحضير الصورة')
    }
  }

  function cancelPreview() {
    if (preview?.url) URL.revokeObjectURL(preview.url)
    setPreview(null)
    resetMessages()
  }

  function confirmUpload() {
    if (!preview) return
    resetMessages()

    const fd = new FormData()
    // اسم الملف لا يهم — server action يقرر المسار. نضع .jpg ليطابق الـ MIME
    fd.append('file', new File([preview.blob], 'avatar.jpg', { type: TARGET_MIME }))

    startTransition(async () => {
      const result = await uploadAvatar(fd)
      if ('error' in result) {
        setError(result.error)
        return
      }
      if (preview?.url) URL.revokeObjectURL(preview.url)
      setPreview(null)
      setDisplayUrl(result.avatarUrl)
      setSuccess('✓ تم تحديث الصورة الرمزية')
      router.refresh()
      setTimeout(() => setSuccess(''), 3500)
    })
  }

  function handleRemove() {
    if (!displayUrl) return
    if (!confirm('هل تريد حذف الصورة الرمزية؟')) return
    resetMessages()
    startTransition(async () => {
      const result = await removeAvatar()
      if ('error' in result) {
        setError(result.error)
        return
      }
      setDisplayUrl(null)
      setSuccess('✓ تم حذف الصورة الرمزية')
      router.refresh()
      setTimeout(() => setSuccess(''), 3500)
    })
  }

  const previewing = !!preview
  const shownUrl = preview?.url ?? displayUrl

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          الصورة الرمزية
        </h2>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--text-second)' }}>
          صورة مربعة، JPEG/PNG/WebP، حتى 5 ميجا. سيُعاد ضبط حجمها تلقائياً إلى 512×512.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* المعاينة */}
        <div
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${previewing ? 'var(--warning)' : 'var(--blue-primary)'}`,
            boxShadow: '0 0 0 4px rgba(21,118,212,0.15)',
            flexShrink: 0,
            position: 'relative',
            backgroundColor: 'var(--bg-surface2)',
          }}
        >
          {shownUrl ? (
            // معاينة blob محلية + رابط supabase — كلاهما يعمل مع <img>
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownUrl}
              alt="الصورة الرمزية"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {fallbackInitial}
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
          {!previewing && (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={pending}
                style={primaryBtn(pending)}
              >
                {displayUrl ? '🖼 تغيير الصورة' : '📷 رفع صورة'}
              </button>
              {displayUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={pending}
                  style={secondaryBtn(pending, 'danger')}
                >
                  {pending ? 'جاري الحذف...' : 'حذف الصورة'}
                </button>
              )}
            </>
          )}

          {previewing && (
            <>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>
                معاينة — اضغط "تأكيد الرفع" لحفظ التغييرات
              </p>
              <button
                type="button"
                onClick={confirmUpload}
                disabled={pending}
                style={primaryBtn(pending)}
              >
                {pending ? 'جاري الرفع...' : '✓ تأكيد الرفع'}
              </button>
              <button
                type="button"
                onClick={cancelPreview}
                disabled={pending}
                style={secondaryBtn(pending, 'neutral')}
              >
                إلغاء
              </button>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '0.6rem 0.875rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(224,82,82,0.1)',
            border: '1px solid rgba(224,82,82,0.3)',
            color: 'var(--error)',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          style={{
            padding: '0.6rem 0.875rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(34,201,138,0.1)',
            border: '1px solid rgba(34,201,138,0.3)',
            color: 'var(--success)',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}
        >
          {success}
        </div>
      )}
    </div>
  )
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: '0.7rem 1rem',
    borderRadius: '12px',
    background: disabled
      ? 'var(--bg-surface2)'
      : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
    color: disabled ? 'var(--text-faint)' : '#fff',
    fontWeight: 700,
    fontSize: '0.9rem',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  }
}

function secondaryBtn(disabled: boolean, tone: 'danger' | 'neutral'): React.CSSProperties {
  const danger = tone === 'danger'
  return {
    padding: '0.6rem 1rem',
    borderRadius: '12px',
    backgroundColor: danger ? 'rgba(224,82,82,0.08)' : 'var(--bg-surface2)',
    border: `1px solid ${danger ? 'rgba(224,82,82,0.4)' : 'var(--border)'}`,
    color: danger ? 'var(--error)' : 'var(--text-second)',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1,
  }
}
