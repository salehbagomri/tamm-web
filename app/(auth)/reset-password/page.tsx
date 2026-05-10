'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (password.length < 8) newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    if (password !== confirmPassword) newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين'

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    setErrors({})
    const result = await updatePassword(password)
    if (result?.error) {
      setErrors({ general: result.error })
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px' }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 0 60px rgba(21,118,212,0.08)',
      }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            تعيين كلمة مرور جديدة
          </h1>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
            أدخل كلمة مرورك الجديدة
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errors.general && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(224,82,82,0.1)',
              border: '1px solid rgba(224,82,82,0.3)',
              borderRadius: '10px',
              color: 'var(--error)',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}>
              {errors.general}
            </div>
          )}

          <Input
            label="كلمة المرور الجديدة"
            id="reset-password"
            type={showPass ? 'text' : 'password'}
            dir="ltr"
            placeholder="8 أحرف على الأقل"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            rightElement={
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 0, display: 'flex' }}>
                <EyeIcon open={showPass} />
              </button>
            }
          />

          <Input
            label="تأكيد كلمة المرور"
            id="reset-confirm"
            type={showConfirm ? 'text' : 'password'}
            dir="ltr"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
            rightElement={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 0, display: 'flex' }}>
                <EyeIcon open={showConfirm} />
              </button>
            }
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
            تحديث كلمة المرور
          </Button>
        </form>
      </div>
    </div>
  )
}
