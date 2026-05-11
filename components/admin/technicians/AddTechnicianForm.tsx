'use client'

import { useState } from 'react'
import { addTechnician } from '@/lib/actions/admin/technicians'

export default function AddTechnicianForm() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('يرجى إدخال البريد الإلكتروني'); return }
    setLoading(true); setError(''); setSuccess('')

    const res = await addTechnician(email.trim())
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess('تم إضافة الفني بنجاح ✓')
      setEmail('')
      setTimeout(() => setSuccess(''), 4000)
    }
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني للفني..."
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
          {loading ? 'جاري الإضافة...' : '+ إضافة'}
        </button>
      </form>

      <p style={{ margin: '0.875rem 0 0', fontSize: '0.8rem', color: 'var(--text-faint)', lineHeight: 1.5 }}>
        يجب أن يكون المستخدم مسجلاً مسبقاً وأن يكون دوره <strong style={{ color: 'var(--blue-light)' }}>technician</strong>
      </p>
    </div>
  )
}
