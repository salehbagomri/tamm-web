'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const QUOTE_STATUS_OPTIONS = [
  { value: 'all',      label: 'كل العروض' },
  { value: 'pending',  label: 'بانتظار الإرسال' },
  { value: 'sent',     label: 'مرسل' },
  { value: 'accepted', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
]

export default function QuotesFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center',
      padding: '1rem 1.25rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      marginBottom: '1.25rem',
    }}>
      <span style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 600 }}>
        فلتر حالة العرض:
      </span>
      <select
        value={searchParams.get('quote_status') ?? 'all'}
        onChange={(e) => updateParam('quote_status', e.target.value)}
        style={{
          padding: '0.5rem 0.875rem',
          backgroundColor: 'var(--bg-surface2)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          minWidth: '180px',
        }}
      >
        {QUOTE_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {searchParams.get('quote_status') && (
        <button onClick={() => router.push(pathname)}
          style={{ padding: '0.5rem 0.875rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✕ إعادة ضبط
        </button>
      )}
    </div>
  )
}
