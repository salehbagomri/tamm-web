'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { StockMovementType } from '@/lib/types/stock-movement'

const TYPE_OPTIONS: { value: StockMovementType | 'all'; label: string }[] = [
  { value: 'all', label: 'كل الحركات' },
  { value: 'sale', label: 'بيع (طلب)' },
  { value: 'cancel_return', label: 'إرجاع (إلغاء)' },
  { value: 'import', label: 'استيراد' },
  { value: 'manual_adjustment', label: 'تعديل يدوي' },
]

export default function StockMovementsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '')
  }, [searchParams])

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value.length > 0) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', search.trim() || null)
  }

  const currentType = searchParams.get('type') ?? 'all'
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''

  const inputStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
      marginBottom: '1.25rem', alignItems: 'center',
    }}>
      <select
        value={currentType}
        onChange={(e) => updateParam('type', e.target.value === 'all' ? null : e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        {TYPE_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 240px' }}>
        <input
          type="text"
          placeholder="بحث باسم المنتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="submit" style={{
          ...inputStyle,
          padding: '0.625rem 1rem',
          backgroundColor: 'var(--blue-primary)',
          color: '#fff',
          border: '1px solid var(--blue-primary)',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          بحث
        </button>
      </form>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-second)' }}>من:</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => updateParam('dateFrom', e.target.value || null)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          onFocus={(e) => e.currentTarget.showPicker?.()}
          className="tamm-date-input"
          style={{ ...inputStyle, cursor: 'pointer', minWidth: '150px' }}
        />
        <label style={{ fontSize: '0.85rem', color: 'var(--text-second)' }}>إلى:</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => updateParam('dateTo', e.target.value || null)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          onFocus={(e) => e.currentTarget.showPicker?.()}
          className="tamm-date-input"
          style={{ ...inputStyle, cursor: 'pointer', minWidth: '150px' }}
        />
      </div>

      {(currentType !== 'all' || search || dateFrom || dateTo) && (
        <button
          onClick={() => router.push(pathname)}
          style={{
            ...inputStyle,
            padding: '0.5rem 0.875rem',
            backgroundColor: 'transparent',
            color: 'var(--text-second)',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          إعادة تعيين
        </button>
      )}

      <style>{`
        .tamm-date-input::-webkit-calendar-picker-indicator {
          filter: invert(0.85);
          cursor: pointer;
          opacity: 0.85;
          margin-inline-start: 0.25rem;
        }
        .tamm-date-input::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        .tamm-date-input::-webkit-datetime-edit-fields-wrapper {
          color: var(--text-primary);
        }
        .tamm-date-input:not(:focus):placeholder-shown,
        .tamm-date-input:invalid {
          color: var(--text-faint);
        }
      `}</style>
    </div>
  )
}
