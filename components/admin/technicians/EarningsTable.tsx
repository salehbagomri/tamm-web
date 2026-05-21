'use client'

import { useState } from 'react'
import type { TechnicianEarning } from '@/lib/types/commission'
import { TASK_TYPE_LABELS } from '@/lib/types/commission'
import { markEarningAsPaid } from '@/lib/actions/admin/commissions'
import { useRouter } from 'next/navigation'

interface Props {
  earnings: TechnicianEarning[]
}

export default function EarningsTable({ earnings }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const router = useRouter()

  const filtered = earnings.filter(e => {
    if (filter === 'pending') return !e.isPaid
    if (filter === 'paid') return e.isPaid
    return true
  })

  const handleMarkPaid = async (id: string) => {
    setLoading(id)
    const res = await markEarningAsPaid(id)
    if (!res.error) {
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div>
      {/* أزرار الفلترة */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {([
          { key: 'all', label: 'الكل' },
          { key: 'pending', label: 'معلقة' },
          { key: 'paid', label: 'مصروفة' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${filter === f.key ? 'var(--blue-primary)' : 'var(--border)'}`,
              backgroundColor: filter === f.key ? 'rgba(21,118,212,0.15)' : 'var(--bg-surface)',
              color: filter === f.key ? 'var(--blue-light)' : 'var(--text-second)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-faint)',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}>
          لا توجد مستحقات {filter === 'pending' ? 'معلقة' : filter === 'paid' ? 'مصروفة' : ''}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-faint)', fontWeight: 600 }}>الفني</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-faint)', fontWeight: 600 }}>رقم الطلب</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-faint)', fontWeight: 600 }}>نوع المهمة</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-faint)', fontWeight: 600 }}>مبلغ الطلب</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-faint)', fontWeight: 600 }}>العمولة</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-faint)', fontWeight: 600 }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {e.technicianName ?? '—'}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-second)' }}>
                    #{e.orderNumber ?? e.orderId.substring(0, 8)}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-second)' }}>
                    {TASK_TYPE_LABELS[e.taskType] ?? e.taskType}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-second)' }}>
                    {e.orderAmount.toFixed(0)} ر.س
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--blue-light)' }}>
                    {e.commissionAmount.toFixed(0)} ر.س
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {e.isPaid ? (
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(34,201,138,0.15)',
                        color: 'var(--success)',
                      }}>تم الصرف</span>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(e.id)}
                        disabled={loading === e.id}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'var(--success)',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          opacity: loading === e.id ? 0.6 : 1,
                        }}
                      >
                        {loading === e.id ? '...' : 'تسجيل صرف'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
