'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface AdminOrdersPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
}

export default function AdminOrdersPagination({
  currentPage, totalPages, totalCount,
}: AdminOrdersPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  const btnBase = {
    padding: '0.5rem 0.875rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: 600,
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
      {/* السابق */}
      <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}
        style={{ ...btnBase, backgroundColor: 'var(--bg-surface)', color: currentPage <= 1 ? 'var(--text-faint)' : 'var(--text-second)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}>
        ← السابق
      </button>

      {/* أرقام الصفحات */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
        .reduce<(number | '...')[]>((acc, p, i, arr) => {
          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
          acc.push(p)
          return acc
        }, [])
        .map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} style={{ color: 'var(--text-faint)', padding: '0 0.25rem' }}>...</span>
          ) : (
            <button key={p} onClick={() => goTo(p as number)}
              style={{
                ...btnBase,
                minWidth: '38px',
                backgroundColor: currentPage === p ? 'var(--blue-primary)' : 'var(--bg-surface)',
                color: currentPage === p ? '#fff' : 'var(--text-second)',
                border: `1px solid ${currentPage === p ? 'var(--blue-primary)' : 'var(--border)'}`,
              }}>
              {p}
            </button>
          )
        )
      }

      {/* التالي */}
      <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= totalPages}
        style={{ ...btnBase, backgroundColor: 'var(--bg-surface)', color: currentPage >= totalPages ? 'var(--text-faint)' : 'var(--text-second)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}>
        التالي →
      </button>
    </div>
  )
}
