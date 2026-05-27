'use client'

import { useState, useTransition } from 'react'
import Input from '@/components/ui/Input'
import { changeEmail } from '@/lib/actions/account-security'

interface ChangeEmailFormProps {
  currentEmail: string
}

export default function ChangeEmailForm({ currentEmail }: ChangeEmailFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  function validate(): boolean {
    const e: typeof errors = {}
    const clean = email.trim().toLowerCase()
    if (!clean) e.email = 'مطلوب'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) e.email = 'صيغة البريد غير صحيحة'
    else if (clean === currentEmail.toLowerCase()) e.email = 'هذا هو بريدك الحالي'
    if (!password) e.password = 'مطلوب للتأكيد'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    setSuccess(false)
    if (!validate()) return

    startTransition(async () => {
      const result = await changeEmail(email.trim(), password)
      if ('error' in result) {
        setServerError(result.error)
        return
      }
      setSuccess(true)
      setEmail('')
      setPassword('')
    })
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
      }}
    >
      <h2 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        📧 تغيير البريد الإلكتروني
      </h2>
      <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: 'var(--text-second)', lineHeight: 1.55 }}>
        بريدك الحالي:{' '}
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, direction: 'ltr', display: 'inline-block' }}>
          {currentEmail}
        </span>
      </p>

      {success ? (
        <div
          role="status"
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(34,201,138,0.08)',
            border: '1px solid rgba(34,201,138,0.3)',
            color: 'var(--success)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>✓ تم إرسال رابط التأكيد</p>
          <p style={{ margin: 0, color: 'var(--text-second)' }}>
            افتح بريدك الإلكتروني الجديد واضغط على رابط التأكيد لاستكمال التغيير.
            لن يتم التغيير قبل تأكيدك للرابط.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            id="new-email"
            label="البريد الإلكتروني الجديد"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
            error={errors.email}
            autoComplete="email"
            placeholder="example@domain.com"
            style={{ textAlign: 'right' }}
          />
          <Input
            id="confirm-email-password"
            label="كلمة المرور للتأكيد"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
            error={errors.password}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-faint)', cursor: 'pointer',
                  padding: '0.25rem', display: 'flex', alignItems: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            }
          />

          {serverError && (
            <div
              role="alert"
              style={{
                padding: '0.6rem 0.875rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(224,82,82,0.1)',
                border: '1px solid rgba(224,82,82,0.3)',
                color: 'var(--error)',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              background: pending
                ? 'var(--bg-surface2)'
                : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
              color: pending ? 'var(--text-faint)' : '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: pending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {pending ? 'جاري الإرسال...' : 'إرسال رابط التأكيد'}
          </button>
        </form>
      )}
    </div>
  )
}
