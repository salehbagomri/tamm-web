'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUpWithEmail } from '@/lib/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import TammLogo from '@/components/ui/TammLogo'

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

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'يرجى إدخال اسمك الكامل'
    if (!email) newErrors.email = 'يرجى إدخال البريد الإلكتروني'
    if (password.length < 8) newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    if (password !== confirmPassword) newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين'

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    setErrors({})

    const result = await signUpWithEmail(name.trim(), email, password)

    if (result?.emailSent) {
      setEmailSent(true)
      setLoading(false)
      return
    }
    if (result?.error) {
      setErrors({ general: result.error })
      setLoading(false)
    }
  }

  // رسالة نجاح الإرسال
  if (emailSent) {
    return (
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            تحقق من بريدك الإلكتروني
          </h1>
          <p style={{ color: 'var(--text-second)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            أرسلنا رابط التأكيد إلى <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
            <br />افتح البريد وانقر على الرابط لتفعيل حسابك.
          </p>
          <Link href="/login" style={{
            display: 'block',
            padding: '0.75rem',
            textAlign: 'center',
            backgroundColor: 'var(--blue-primary)',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    )
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
        {/* الشعار */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 8px 24px rgba(34,201,138,0.25))',
          }}>
            <TammLogo size={64} variant="light" />
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            إنشاء حساب جديد
          </h1>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
            انضم إلى منصة تمّ اليوم
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
            label="الاسم الكامل"
            id="reg-name"
            type="text"
            dir="rtl"
            placeholder="أدخل اسمك الكامل"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            autoComplete="name"
          />

          <Input
            label="البريد الإلكتروني"
            id="reg-email"
            type="email"
            dir="ltr"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="كلمة المرور"
            id="reg-password"
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
            id="reg-confirm"
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
            إنشاء الحساب
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>
          لديك حساب بالفعل؟{' '}
          <Link href="/login" style={{ color: 'var(--blue-light)', fontWeight: 600 }}>
            سجّل دخولك
          </Link>
        </p>
      </div>
    </div>
  )
}
