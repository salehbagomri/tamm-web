'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'

const CATEGORY_OPTIONS = [
  { value: 'all',           label: 'كل الفئات' },
  { value: 'ac',            label: 'تكييف' },
  { value: 'solar_panel',   label: 'ألواح شمسية' },
  { value: 'solar_battery', label: 'بطاريات شمسية' },
  { value: 'solar_inverter','label': 'إنفيرتر شمسي' },
  { value: 'accessory',     label: 'إكسسوارات' },
]

export default function AdminProductsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const handleSearch = (val: string) => {
    setSearch(val)
    if (timer) clearTimeout(timer)
    const t = setTimeout(() => updateParam('search', val), 500)
    setTimer(t)
  }

  const sel = { padding: '0.5rem 0.875rem', backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }

  const hasFilter = searchParams.get('category') || searchParams.get('search')

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', marginBottom: '1.25rem' }}>
      <input type="text" placeholder="🔍 ابحث بالاسم..." value={search}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ ...sel, minWidth: '200px', flex: 1 }} />
      <select value={searchParams.get('category') ?? 'all'}
        onChange={(e) => updateParam('category', e.target.value)} style={{ ...sel, minWidth: '150px' }}>
        {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hasFilter && (
        <button onClick={() => { setSearch(''); router.push(pathname) }}
          style={{ ...sel, backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', fontWeight: 600 }}>
          ✕ إعادة ضبط
        </button>
      )}
    </div>
  )
}
