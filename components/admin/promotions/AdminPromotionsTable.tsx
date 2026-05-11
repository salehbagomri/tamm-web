'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AdminPromotion } from '@/lib/data/admin/promotions'
import { togglePromotionStatus, deletePromotion } from '@/lib/actions/admin/promotions'

function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', padding: '2px', backgroundColor: checked ? 'var(--success)' : 'var(--bg-surface2)', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start' }}>
      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

export default function AdminPromotionsTable({ promotions }: { promotions: AdminPromotion[] }) {
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    await togglePromotionStatus(id, !current)
    setTogglingId(null)
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true)
    await deletePromotion(id)
    setDeleteLoading(false)
    setDeletingId(null)
  }

  if (promotions.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
      لا يوجد عروض مضافة حتى الآن
    </div>
  )

  return (
    <>
      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem', fontWeight: 700 }}>حذف العرض</h3>
            <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>هل أنت متأكد من حذف هذا العرض نهائياً؟</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeletingId(null)}
                style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface2)', color: 'var(--text-second)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                إلغاء
              </button>
              <button onClick={() => handleDelete(deletingId)} disabled={deleteLoading}
                style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: 'var(--error)', color: '#fff', cursor: deleteLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, opacity: deleteLoading ? 0.7 : 1 }}>
                {deleteLoading ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface2)' }}>
              {['العرض', 'الوجهة', 'الترتيب', 'الحالة', 'إجراءات'].map((h, i) => (
                <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {promotions.map((p, i) => (
              <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '60px', height: '40px', borderRadius: '8px', background: p.gradientStart ? `linear-gradient(135deg, ${p.gradientStart}, ${p.gradientEnd || p.gradientStart})` : 'var(--blue-mid)' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{p.title}</div>
                      {p.subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-second)' }}>{p.subtitle}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-second)' }} dir="ltr" align="right">
                  {p.destination || '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-second)' }}>
                  {p.sortOrder}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Toggle
                    checked={togglingId === p.id ? !p.isActive : p.isActive}
                    onToggle={() => handleToggle(p.id, p.isActive)}
                  />
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/admin/promotions/${p.id}/edit`} style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)', textDecoration: 'none' }}>
                      تعديل
                    </Link>
                    <button onClick={() => setDeletingId(p.id)}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', cursor: 'pointer', fontFamily: 'inherit' }}>
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
