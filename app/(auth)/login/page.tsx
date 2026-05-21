'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signInWithEmail } from '@/lib/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import TammLogo from '@/components/ui/TammLogo'

// أيقونة Google
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// أيقونة إظهار/إخفاء كلمة المرور
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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // تسجيل الدخول بـ Email
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: typeof errors = {}
    if (!email) newErrors.email = 'يرجى إدخال البريد الإلكتروني'
    if (!password) newErrors.password = 'يرجى إدخال كلمة المرور'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    setErrors({})
    const result = await signInWithEmail(email, password)
    if (result?.error) {
      setErrors({ general: result.error })
      setLoading(false)
    }
  }

  // تسجيل الدخول بـ Google
  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const supabase = createClient()
    const siteUrl = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${siteUrl}/auth/callback` },
    })
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px' }}>
      {/* البطاقة */}
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
            مرحباً بك
          </h1>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
            سجّل دخولك للمتابعة
          </p>
        </div>

        {/* زر Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: '#1a1a1a',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            opacity: googleLoading ? 0.7 : 1,
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          <GoogleIcon />
          {googleLoading ? 'جاري التوجيه...' : 'تسجيل الدخول بـ Google'}
        </button>

        {/* فاصل */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>أو</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* نموذج Email */}
        <form onSubmit={handleEmailLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* خطأ عام */}
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
            label="البريد الإلكتروني"
            id="login-email"
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
            id="login-password"
            type={showPass ? 'text' : 'password'}
            dir="ltr"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 0, display: 'flex' }}
              >
                <EyeIcon open={showPass} />
              </button>
            }
          />

          {/* نسيت كلمة المرور */}
          <div style={{ textAlign: 'left' }}>
            <Link href="/forgot-password" style={{ color: 'var(--blue-light)', fontSize: '0.875rem' }}>
              نسيت كلمة المرور؟
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
            تسجيل الدخول
          </Button>
        </form>

        {/* رابط التسجيل */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>
          ليس لديك حساب؟{' '}
          <Link href="/register" style={{ color: 'var(--blue-light)', fontWeight: 600 }}>
            سجّل الآن
          </Link>
        </p>
      </div>
    </div>
  )
}
