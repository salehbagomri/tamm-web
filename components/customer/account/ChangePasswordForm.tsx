'use client'

import { useState, useTransition } from 'react'
import Input from '@/components/ui/Input'
import { changePassword } from '@/lib/actions/account-security'

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  function validate(): boolean {
    const e: typeof errors = {}
    if (!current) e.current = 'مطلوب'
    if (!next) e.next = 'مطلوب'
    else if (next.length < 8 || !/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
      e.next = '8 أحرف على الأقل، تحتوي حرفاً ورقماً'
    }
    if (!confirm) e.confirm = 'مطلوب'
    else if (confirm !== next) e.confirm = 'لا تطابق كلمة المرور الجديدة'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    setSuccess(false)
    if (!validate()) return

    startTransition(async () => {
      const result = await changePassword(current, next)
      if ('error' in result) {
        setServerError(result.error)
        return
      }
      setSuccess(true)
      setCurrent('')
      setNext('')
      setConfirm('')
      setTimeout(() => setSuccess(false), 5000)
    })
  }

  const eyeBtn = (open: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      tabIndex={-1}
      aria-label={open ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-faint)',
        cursor: 'pointer',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )

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
        🔐 تغيير كلمة المرور
      </h2>
      <p style={{ margin: '0 0 1.25rem', fontSize: '0.8rem', color: 'var(--text-second)' }}>
        كلمة المرور القوية تحمي حسابك. استخدم 8 أحرف على الأقل وامزج بين الحروف والأرقام.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          id="current-password"
          label="كلمة المرور الحالية"
          type={showCurrent ? 'text' : 'password'}
          value={current}
          onChange={(e) => { setCurrent(e.target.value); setErrors(p => ({ ...p, current: undefined })) }}
          error={errors.current}
          autoComplete="current-password"
          rightElement={eyeBtn(showCurrent, () => setShowCurrent(v => !v))}
        />
        <Input
          id="new-password"
          label="كلمة المرور الجديدة"
          type={showNext ? 'text' : 'password'}
          value={next}
          onChange={(e) => { setNext(e.target.value); setErrors(p => ({ ...p, next: undefined })) }}
          error={errors.next}
          autoComplete="new-password"
          rightElement={eyeBtn(showNext, () => setShowNext(v => !v))}
        />
        <Input
          id="confirm-password"
          label="تأكيد كلمة المرور الجديدة"
          type={showNext ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })) }}
          error={errors.confirm}
          autoComplete="new-password"
        />

        {serverError && (
          <div style={msgBox('error')}>{serverError}</div>
        )}
        {success && (
          <div style={msgBox('success')}>✓ تم تغيير كلمة المرور بنجاح</div>
        )}

        <button
          type="submit"
          disabled={pending}
          style={primaryBtn(pending)}
        >
          {pending ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
        </button>
      </form>
    </div>
  )
}

function msgBox(tone: 'error' | 'success'): React.CSSProperties {
  const danger = tone === 'error'
  return {
    padding: '0.6rem 0.875rem',
    borderRadius: '10px',
    backgroundColor: danger ? 'rgba(224,82,82,0.1)' : 'rgba(34,201,138,0.1)',
    border: `1px solid ${danger ? 'rgba(224,82,82,0.3)' : 'rgba(34,201,138,0.3)'}`,
    color: danger ? 'var(--error)' : 'var(--success)',
    fontSize: '0.85rem',
    textAlign: 'center',
  }
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: '0.85rem', borderRadius: '12px',
    background: disabled ? 'var(--bg-surface2)' : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
    color: disabled ? 'var(--text-faint)' : '#fff',
    fontWeight: 700, fontSize: '0.95rem', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  }
}
