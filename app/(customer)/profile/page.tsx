import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getProfile, getProfileStats } from '@/lib/data/profile'
import ProfileHeader from '@/components/customer/profile/ProfileHeader'
import ProfileStats from '@/components/customer/profile/ProfileStats'
import ProfileForm from '@/components/customer/profile/ProfileForm'
import DangerZone from '@/components/customer/profile/DangerZone'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ملفي الشخصي | تمّ',
  description: 'إدارة بياناتك الشخصية وتتبع طلباتك في منصة تمّ',
}

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, stats] = await Promise.all([
    getProfile(user.id),
    getProfileStats(user.id),
  ])

  if (!profile) redirect('/login')

  return (
    <>
      {/* Responsive styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .profile-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          align-items: start;
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        .profile-sidebar { position: sticky; top: 1.5rem; }
        .profile-main { display: flex; flex-direction: column; gap: 1.5rem; }
        @media (max-width: 768px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
          .profile-sidebar { position: static; }
        }
      ` }} />

      <div className="profile-layout">
        {/* اليسار — الـ Sidebar */}
        <div className="profile-sidebar">
          <ProfileHeader profile={profile} />
        </div>

        {/* اليمين — المحتوى */}
        <div className="profile-main">
          <ProfileStats stats={stats} />
          <ProfileForm profile={profile} />
          <DangerZone />
        </div>
      </div>
    </>
  )
}
