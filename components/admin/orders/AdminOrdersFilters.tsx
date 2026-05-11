'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import type { OrderStatus, OrderType } from '@/lib/types/order'

const STATUS_OPTIONS = [
  { value: 'all',         label: 'كل الحالات' },
  { value: 'pending',     label: 'معلق' },
  { value: 'confirmed',   label: 'مؤكد' },
  { value: 'assigned',    label: 'تم التعيين' },
  { value: 'on_the_way',  label: 'في الطريق' },
  { value: 'in_progress', label: 'جاري التنفيذ' },
  { value: 'completed',   label: 'مكتمل' },
  { value: 'cancelled',   label: 'ملغي' },
]

const TYPE_OPTIONS = [
  { value: 'all',                 label: 'كل الأنواع' },
  { value: 'product',             label: 'منتجات' },
  { value: 'service',             label: 'خدمات' },
  { value: 'product_and_service', label: 'منتج + خدمة' },
  { value: 'quote_request',       label: 'عروض أسعار' },
]

const selectStyle = {
  padding: '0.5rem 0.875rem',
  backgroundColor: 'var(--bg-surface2)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  minWidth: '140px',
}

export default function AdminOrdersFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') params.set(key, value)
      else params.delete(key)
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const handleSearch = (val: string) => {
    setSearch(val)
    if (debounceTimer) clearTimeout(debounceTimer)
    const timer = setTimeout(() => updateParam('search', val), 500)
    setDebounceTimer(timer)
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'center',
      padding: '1rem 1.25rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      marginBottom: '1.25rem',
    }}>
      {/* بحث */}
      <input
        type="text"
        placeholder="🔍 ابحث بالاسم أو رقم الطلب..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          ...selectStyle,
          minWidth: '220px',
          flex: 1,
        }}
      />

      {/* فلتر الحالة */}
      <select
        value={searchParams.get('status') ?? 'all'}
        onChange={(e) => updateParam('status', e.target.value)}
        style={selectStyle}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* فلتر النوع */}
      <select
        value={searchParams.get('order_type') ?? 'all'}
        onChange={(e) => updateParam('order_type', e.target.value)}
        style={selectStyle}
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* زر إعادة ضبط */}
      {(searchParams.get('status') || searchParams.get('order_type') || searchParams.get('search')) && (
        <button
          onClick={() => { setSearch(''); router.push(pathname) }}
          style={{
            padding: '0.5rem 0.875rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(224,82,82,0.08)',
            border: '1px solid rgba(224,82,82,0.2)',
            color: 'var(--error)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          ✕ إعادة ضبط
        </button>
      )}
    </div>
  )
}
