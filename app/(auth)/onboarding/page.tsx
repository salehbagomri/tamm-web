import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/utils/auth'
import OnboardingForm from '@/components/onboarding/OnboardingForm'
import TammLogo from '@/components/ui/TammLogo'
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
            display: 'inline-flex',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 8px 24px rgba(34,201,138,0.25))',
          }}>
            <TammLogo size={64} />
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
