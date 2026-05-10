'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

interface StorePaginationProps {
  totalPages: number
  currentPage: number
}

export default function StorePagination({ totalPages, currentPage }: StorePaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (totalPages <= 1) return null

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  // توليد أرقام الصفحات مع ellipsis
  function getPages(): (number | '...')[] {
    const delta = 2
    const pages: (number | '...')[] = []
    const left = currentPage - delta
    const right = currentPage + delta

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  const btnBase: React.CSSProperties = {
    minWidth: '38px', height: '38px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
    border: '1px solid var(--border)', fontFamily: 'inherit',
    transition: 'all 0.15s',
    opacity: isPending ? 0.6 : 1,
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.375rem', marginTop: '2.5rem', flexWrap: 'wrap',
    }}>
      {/* السابق */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        style={{
          ...btnBase,
          backgroundColor: 'var(--bg-surface)',
          color: currentPage === 1 ? 'var(--text-faint)' : 'var(--text-second)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          padding: '0 0.75rem',
        }}
      >
        ›
      </button>

      {/* الصفحات */}
      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`e-${i}`} style={{ color: 'var(--text-faint)', padding: '0 0.25rem' }}>…</span>
        ) : (
          <button
            key={page}
            onClick={() => goTo(page as number)}
            disabled={isPending}
            style={{
              ...btnBase,
              backgroundColor: currentPage === page ? 'var(--blue-primary)' : 'var(--bg-surface)',
              color: currentPage === page ? '#fff' : 'var(--text-second)',
              borderColor: currentPage === page ? 'var(--blue-primary)' : 'var(--border)',
              fontWeight: currentPage === page ? 700 : 400,
            }}
          >
            {page}
          </button>
        )
      )}

      {/* التالي */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        style={{
          ...btnBase,
          backgroundColor: 'var(--bg-surface)',
          color: currentPage === totalPages ? 'var(--text-faint)' : 'var(--text-second)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          padding: '0 0.75rem',
        }}
      >
        ‹
      </button>
    </div>
  )
}
