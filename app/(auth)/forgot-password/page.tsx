'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('يرجى إدخال بريدك الإلكتروني'); return }

    setLoading(true)
    setError('')
    const result = await resetPassword(email)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
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
        textAlign: success ? 'center' : 'right',
      }}>
        {success ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              تم إرسال الرابط
            </h1>
            <p style={{ color: 'var(--text-second)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              أرسلنا رابط إعادة تعيين كلمة المرور إلى{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
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
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                نسيت كلمة المرور؟
              </h1>
              <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="البريد الإلكتروني"
                id="forgot-email"
                type="email"
                dir="ltr"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                autoComplete="email"
              />
              <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
                إرسال رابط الاستعادة
              </Button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>
              <Link href="/login" style={{ color: 'var(--blue-light)', fontWeight: 600 }}>
                ← العودة لتسجيل الدخول
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
