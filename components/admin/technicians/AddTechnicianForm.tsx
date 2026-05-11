'use client'

import { useState } from 'react'
import { searchCandidate, promoteAndAddTechnician, TechnicianCandidate } from '@/lib/actions/admin/technicians'

export default function AddTechnicianForm() {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')
  const [candidate, setCandidate] = useState<TechnicianCandidate | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim()) { setError('يرجى إدخال البريد الإلكتروني أو رقم الجوال'); return }
    setLoading(true); setError(''); setSuccess(''); setCandidate(null)

    const res = await searchCandidate(identifier.trim())
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else if (res.candidate) {
      setCandidate(res.candidate)
    }
  }

  async function handlePromote() {
    if (!candidate) return
    setLoading(true); setError(''); setSuccess('')

    const res = await promoteAndAddTechnician(candidate.id)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess('تم ترقية وإضافة الفني بنجاح ✓')
      setIdentifier('')
      setCandidate(null)
      setTimeout(() => setSuccess(''), 4000)
    }
  }

  function handleCancel() {
    setCandidate(null)
    setIdentifier('')
    setError('')
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        ➕ إضافة فني جديد
      </h3>

      {success && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: 'rgba(34,201,138,0.1)', border: '1px solid rgba(34,201,138,0.3)', color: 'var(--success)', fontSize: '0.875rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {!candidate ? (
        <>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="البريد الإلكتروني أو رقم الجوال للمستخدم..."
              style={{
                flex: 1, minWidth: '240px', padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                color: 'var(--text-primary)', fontSize: '0.9rem',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button type="submit" disabled={loading} style={{
              padding: '0.75rem 1.5rem', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
              color: '#fff', fontWeight: 700, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}>
              {loading ? 'جاري البحث...' : 'بحث'}
            </button>
          </form>
          <p style={{ margin: '0.875rem 0 0', fontSize: '0.8rem', color: 'var(--text-faint)', lineHeight: 1.5 }}>
            ابحث عن المستخدم المسجل مسبقاً في النظام لترقيته إلى <strong style={{ color: 'var(--blue-light)' }}>فني</strong>.
          </p>
        </>
      ) : (
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>بيانات المستخدم:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-second)' }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>الاسم:</strong> {candidate.fullName}</div>
            {candidate.email && <div><strong style={{ color: 'var(--text-primary)' }}>الإيميل:</strong> {candidate.email}</div>}
            {candidate.phone && <div><strong style={{ color: 'var(--text-primary)' }}>الجوال:</strong> {candidate.phone}</div>}
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>الدور الحالي:</strong>{' '}
              <span style={{ 
                color: candidate.role === 'technician' ? 'var(--blue-light)' : 'var(--warning)',
                fontWeight: 600 
              }}>
                {candidate.role === 'technician' ? 'فني (technician)' : candidate.role === 'customer' ? 'عميل (customer)' : candidate.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handlePromote} disabled={loading} style={{
              flex: 1, padding: '0.75rem', borderRadius: '8px',
              backgroundColor: 'var(--success)', color: '#fff', fontWeight: 700,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'جاري التنفيذ...' : 'تأكيد وإضافة كفني'}
            </button>
            <button onClick={handleCancel} disabled={loading} style={{
              padding: '0.75rem 1.5rem', borderRadius: '8px',
              backgroundColor: 'transparent', color: 'var(--text-second)', fontWeight: 600,
              border: '1px solid var(--border)', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}>
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
