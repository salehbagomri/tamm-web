import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import ChangePasswordForm from '@/components/customer/account/ChangePasswordForm'
import ChangeEmailForm from '@/components/customer/account/ChangeEmailForm'
import SessionInfoCard from '@/components/customer/account/SessionInfoCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الأمان | حسابي — تمّ',
  description: 'إدارة كلمة المرور والبريد الإلكتروني وجلسات الدخول',
}

export default async function AccountSecurityPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const lastSignInAt = user.last_sign_in_at ?? null
  const emailConfirmedAt = user.email_confirmed_at ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <nav
        aria-label="breadcrumb"
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-second)' }}
      >
        <Link href="/account" style={{ color: 'var(--blue-light)', textDecoration: 'none', fontWeight: 600 }}>
          حسابي
        </Link>
        <span aria-hidden style={{ color: 'var(--text-faint)' }}>›</span>
        <span style={{ color: 'var(--text-second)' }}>الأمان</span>
      </nav>

      <div>
        <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          الأمان
        </h1>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.875rem', color: 'var(--text-second)' }}>
          إدارة كلمة المرور والبريد الإلكتروني، ومراقبة جلسات الدخول النشطة على حسابك.
        </p>
      </div>

      <ChangePasswordForm />
      <ChangeEmailForm currentEmail={user.email ?? ''} />
      <SessionInfoCard lastSignInAt={lastSignInAt} emailConfirmedAt={emailConfirmedAt} />
    </div>
  )
}
