'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AdminTechnician } from '@/lib/data/admin/technicians'
import { removeTechnician, toggleTechnicianAvailability } from '@/lib/actions/admin/technicians'

function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', padding: '2px', backgroundColor: checked ? 'var(--success)' : 'var(--bg-surface2)', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start' }}>
      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

export default function AdminTechniciansTable({ technicians }: { technicians: AdminTechnician[] }) {
  const [togglingId, setTogglingId]   = useState<string | null>(null)
  const [removingId, setRemovingId]   = useState<string | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [removeError, setRemoveError] = useState('')

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    await toggleTechnicianAvailability(id, !current)
    setTogglingId(null)
  }

  async function handleRemove(id: string) {
    setRemoveLoading(true)
    const res = await removeTechnician(id)
    setRemoveLoading(false)
    if (res.error) setRemoveError(res.error)
    else setRemovingId(null)
  }

  if (technicians.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
      لا يوجد فنيون مسجلون حتى الآن
    </div>
  )

  return (
    <>
      {/* Confirm Remove Dialog */}
      {removingId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>👷</p>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem', fontWeight: 700 }}>إزالة الفني</h3>
            {removeError && <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>{removeError}</p>}
            <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', margin: '0 0 0.25rem' }}>
              سيتم إزالة الفني من القائمة فقط.
            </p>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>
              لن يتم حذف حسابه — يمكن إعادة إضافته لاحقاً.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => { setRemovingId(null); setRemoveError('') }}
                style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface2)', color: 'var(--text-second)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                إلغاء
              </button>
              <button onClick={() => handleRemove(removingId)} disabled={removeLoading}
                style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: 'var(--error)', color: '#fff', cursor: removeLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, opacity: removeLoading ? 0.7 : 1 }}>
                {removeLoading ? 'جاري الإزالة...' : 'إزالة من الفنيين'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="tech-desk" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface2)' }}>
              {['الفني', 'الجوال', 'البريد الإلكتروني', 'الطلبات', 'متاح', ''].map((h, i) => (
                <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {technicians.map((t, i) => (
              <tr key={t.technicianId} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                {/* Avatar + الاسم */}
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link href={`/admin/technicians/${t.technicianId}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                        {t.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t.name}</span>
                    </div>
                  </Link>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-second)' }}>
                  {t.phone ?? '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-second)' }}>
                  {t.email ?? '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                  <span style={{ padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)' }}>
                    {t.assignedOrdersCount}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Toggle
                    checked={togglingId === t.technicianId ? !t.isAvailable : t.isAvailable}
                    onToggle={() => handleToggle(t.technicianId, t.isAvailable)}
                  />
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <button onClick={() => { setRemoveError(''); setRemovingId(t.technicianId) }}
                    style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    إزالة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="tech-mob" style={{ display: 'none', flexDirection: 'column', gap: '0', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {technicians.map((t, i) => (
          <div key={t.technicianId} style={{ padding: '1rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Link href={`/admin/technicians/${t.technicianId}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t.name}</span>
                </Link>
              </div>
              <Toggle checked={t.isAvailable} onToggle={() => handleToggle(t.technicianId, t.isAvailable)} />
            </div>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: 'var(--text-second)' }}>{t.phone ?? ''}{t.email ? ` · ${t.email}` : ''}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--blue-light)' }}>طلبات معينة: {t.assignedOrdersCount}</span>
              <button onClick={() => setRemovingId(t.technicianId)}
                style={{ padding: '0.3rem 0.625rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', cursor: 'pointer', fontFamily: 'inherit' }}>
                إزالة
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) { .tech-desk{display:none!important} .tech-mob{display:flex!important} }
      `}</style>
    </>
  )
}
