import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/utils/auth'
import OnboardingForm from '@/components/onboarding/OnboardingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'أكمل بياناتك | تمّ' }

export default async function OnboardingPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await getUserProfile(supabase, user.id)

  if (profile?.isComplete) {
    if (profile.role === 'manager') redirect('/admin/dashboard')
    if (profile.role === 'technician') redirect('/access-denied')
    redirect('/home')
  }

  const role = profile?.role ?? 'customer'

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
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(21,118,212,0.3)',
          }}>
            تمّ
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            أكمل بياناتك
          </h1>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
            نحتاج بعض المعلومات لإكمال حسابك
          </p>
        </div>

        <OnboardingForm role={role} />
      </div>
    </div>
  )
}
