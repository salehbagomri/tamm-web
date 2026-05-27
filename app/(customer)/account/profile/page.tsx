import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/data/profile'
import AccountIdentityCard from '@/components/customer/account/AccountIdentityCard'
import AvatarUploader from '@/components/customer/account/AvatarUploader'
import ProfileForm from '@/components/customer/profile/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الملف الشخصي | حسابي — تمّ',
  description: 'تعديل بياناتك الشخصية والصورة الرمزية',
}

export default async function AccountProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/login')

  const fallbackInitial = profile.fullName?.charAt(0)?.toUpperCase() ?? '؟'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb بسيط */}
      <nav
        aria-label="breadcrumb"
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-second)' }}
      >
        <Link
          href="/account"
          style={{ color: 'var(--blue-light)', textDecoration: 'none', fontWeight: 600 }}
        >
          حسابي
        </Link>
        <span aria-hidden style={{ color: 'var(--text-faint)' }}>›</span>
        <span style={{ color: 'var(--text-second)' }}>الملف الشخصي</span>
      </nav>

      <div>
        <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          الملف الشخصي
        </h1>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.875rem', color: 'var(--text-second)' }}>
          عدّل بياناتك الشخصية وصورتك الرمزية. ستظهر هذه البيانات في طلباتك وفي التواصل من فريق الدعم.
        </p>
      </div>

      <AccountIdentityCard profile={profile} />

      <AvatarUploader initialUrl={profile.avatarUrl} fallbackInitial={fallbackInitial} />

      <ProfileForm profile={profile} />
    </div>
  )
}
