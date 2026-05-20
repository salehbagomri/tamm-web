'use client'

import { useState } from 'react'
import type { ServiceType } from '@/lib/types/service'
import { deleteService, toggleServiceActive } from '@/lib/actions/admin/services'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/format'

const CAT_LABELS: Record<string, string> = {
  ac_install: 'تركيب تكييف', ac_repair: 'إصلاح تكييف',
  ac_wash: 'غسيل تكييف', ac_maintenance: 'صيانة تكييف',
  solar_install: 'تركيب شمسي', solar_maintenance: 'صيانة شمسي',
  consultation: 'استشارة',
}

function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', padding: '2px', backgroundColor: checked ? 'var(--success)' : 'var(--bg-surface2)', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start' }}>
      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

export default function AdminServicesTable({ services }: { services: ServiceType[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleteLoading(true)
    const res = await deleteService(id)
    setDeleteLoading(false)
    if (res.error) setDeleteError(res.error)
    else setDeletingId(null)
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    await toggleServiceActive(id, !current)
    setTogglingId(null)
  }

  if (services.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
      لا توجد خدمات بعد
    </div>
  )

  return (
    <>
      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</p>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>تأكيد حذف الخدمة</h3>
            {deleteError && <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{deleteError}</p>}
            <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
              هل أنت متأكد؟ لا يمكن التراجع.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => { setDeletingId(null); setDeleteError('') }} style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface2)', color: 'var(--text-second)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>إلغاء</button>
              <button onClick={() => handleDelete(deletingId)} disabled={deleteLoading} style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: 'var(--error)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, opacity: deleteLoading ? 0.7 : 1 }}>
                {deleteLoading ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface2)' }}>
              {['الخدمة', 'الفئة', 'السعر الأساسي', 'عرض سعر', 'نشط', ''].map((h, i) => (
                <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <p style={{ margin: '0 0 0.125rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{s.name}</p>
                  {s.estimatedDuration && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-faint)' }}>⏱ {s.estimatedDuration}</p>}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(34,201,138,0.1)', color: 'var(--success)' }}>
                    {CAT_LABELS[s.category] ?? s.category}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {s.isQuoteBased ? <span style={{ color: 'var(--warning)' }}>يُحدد حسب الموقع</span> : formatPrice(s.basePrice)}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  {s.isQuoteBased && <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(245,166,35,0.1)', color: 'var(--warning)' }}>💬 عرض سعر</span>}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Toggle checked={togglingId === s.id ? !s.isActive : s.isActive} onToggle={() => handleToggle(s.id, s.isActive)} />
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/admin/services/${s.id}/edit`} style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)', textDecoration: 'none', whiteSpace: 'nowrap' }}>تعديل</Link>
                    <button onClick={() => { setDeleteError(''); setDeletingId(s.id) }} style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>حذف</button>
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
