'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback, useTransition } from 'react'

const CATEGORIES = [
  { key: 'all', label: 'الكل' },
  { key: 'ac', label: 'مكيفات' },
  { key: 'solar_panel', label: 'ألواح شمسية' },
  { key: 'solar_battery', label: 'بطاريات' },
  { key: 'solar_inverter', label: 'إنفرتر' },
  { key: 'accessory', label: 'إكسسوارات' },
]

const SORT_OPTIONS = [
  { key: 'newest', label: 'الأحدث' },
  { key: 'price_asc', label: 'السعر: من الأقل' },
  { key: 'price_desc', label: 'السعر: من الأعلى' },
  { key: 'featured', label: 'المميزة أولاً' },
]

export default function StoreFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')

  const activeCategory = searchParams.get('category') ?? 'all'
  const activeSort = searchParams.get('sort') ?? 'newest'

  // دالة تحديث الـ URL
  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page') // إعادة الصفحة للأولى عند الفلترة
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
    setIsDrawerOpen(false)
  }, [searchParams, pathname, router])

  // Debounce للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchValue.trim()) {
        params.set('search', searchValue.trim())
      } else {
        params.delete('search')
      }
      params.delete('page')
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchValue, pathname, router, searchParams])

  const FilterContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* بحث */}
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-second)', display: 'block', marginBottom: '0.5rem' }}>
          بحث
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{
              width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
              backgroundColor: 'var(--bg-surface2)',
              border: '1px solid var(--border)', borderRadius: '10px',
              color: 'var(--text-primary)', fontSize: '0.875rem',
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
      </div>

      {/* الفئة */}
      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-second)', marginBottom: '0.625rem' }}>الفئة</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.key} onClick={() => updateFilter('category', cat.key)}
              style={{
                padding: '0.5rem 0.875rem', borderRadius: '8px', textAlign: 'right',
                border: '1px solid',
                borderColor: activeCategory === cat.key ? 'var(--blue-primary)' : 'transparent',
                backgroundColor: activeCategory === cat.key ? 'rgba(21,118,212,0.12)' : 'transparent',
                color: activeCategory === cat.key ? 'var(--blue-light)' : 'var(--text-second)',
                fontWeight: activeCategory === cat.key ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* الترتيب */}
      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-second)', marginBottom: '0.625rem' }}>ترتيب حسب</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => updateFilter('sort', opt.key)}
              style={{
                padding: '0.5rem 0.875rem', borderRadius: '8px', textAlign: 'right',
                border: '1px solid',
                borderColor: activeSort === opt.key ? 'var(--blue-primary)' : 'transparent',
                backgroundColor: activeSort === opt.key ? 'rgba(21,118,212,0.12)' : 'transparent',
                color: activeSort === opt.key ? 'var(--blue-light)' : 'var(--text-second)',
                fontWeight: activeSort === opt.key ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isPending && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>جاري التحديث...</p>
      )}
    </div>
  )

  return (
    <>
      {/* زر الفلتر على الموبايل */}
      <div className="mobile-filter-btn" style={{ display: 'none', marginBottom: '1rem' }}>
        <button onClick={() => setIsDrawerOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 1.25rem', borderRadius: '10px',
          backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem',
          cursor: 'pointer', fontWeight: 500,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
          </svg>
          فلترة
        </button>
      </div>

      {/* Sidebar الديسكتوب */}
      <aside className="desktop-filters" style={{
        width: '220px', flexShrink: 0,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px', padding: '1.25rem',
        height: 'fit-content', position: 'sticky', top: '80px',
      }}>
        {FilterContent}
      </aside>

      {/* Drawer الموبايل */}
      {isDrawerOpen && (
        <>
          <div onClick={() => setIsDrawerOpen(false)} style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 200, backdropFilter: 'blur(4px)',
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px',
            backgroundColor: 'var(--bg-surface)', zIndex: 201,
            padding: '1.5rem', overflowY: 'auto',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-16px 0 40px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>فلترة المنتجات</span>
              <button onClick={() => setIsDrawerOpen(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-second)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {FilterContent}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-filter-btn { display: block !important; }
          .desktop-filters { display: none !important; }
        }
      `}</style>
    </>
  )
}
