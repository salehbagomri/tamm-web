import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getProfile, getProfileStats } from '@/lib/data/profile'
import { getUnreadNotificationsCount } from '@/lib/data/notifications'
import AccountIdentityCard from '@/components/customer/account/AccountIdentityCard'
import AccountHubCard from '@/components/customer/account/AccountHubCard'
import DangerZone from '@/components/customer/profile/DangerZone'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'حسابي | تمّ',
  description: 'إدارة حسابك على منصة تمّ — الملف الشخصي، العناوين، الأمان، والإعدادات',
}

const ICON_PROPS = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export default async function AccountHubPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, stats, unreadNotifications] = await Promise.all([
    getProfile(user.id),
    getProfileStats(user.id),
    getUnreadNotificationsCount(user.id),
  ])

  if (!profile) redirect('/login')

  const activeOrdersBadge = stats.active > 0
    ? { text: `${stats.active.toLocaleString('en-SA')} نشط`, tone: 'info' as const }
    : undefined
  const notificationsBadge = unreadNotifications > 0
    ? { text: `${unreadNotifications.toLocaleString('en-SA')} جديد`, tone: 'warning' as const }
    : undefined
  const profileBadge = !profile.isComplete
    ? { text: 'ناقص', tone: 'warning' as const }
    : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* العنوان */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
          }}
        >
          حسابي
        </h1>
        <p
          style={{
            margin: '0.3rem 0 0',
            fontSize: '0.875rem',
            color: 'var(--text-second)',
          }}
        >
          إدارة بياناتك، طلباتك، عناوينك وإعدادات الأمان من مكان واحد.
        </p>
      </div>

      {/* بطاقة الهوية */}
      <AccountIdentityCard profile={profile} />

      {/* الكروت */}
      <div
        className="account-hub-grid"
        style={{
          display: 'grid',
          gap: '0.875rem',
        }}
      >
        <AccountHubCard
          href="/orders"
          title="طلباتي"
          description={`${stats.total.toLocaleString('en-SA')} طلب${stats.completed > 0 ? ` • ${stats.completed.toLocaleString('en-SA')} مكتمل` : ''}`}
          badge={activeOrdersBadge}
          icon={
            <svg {...ICON_PROPS}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          }
        />

        <AccountHubCard
          href="/notifications"
          title="إشعاراتي"
          description="تنبيهات الطلبات والعروض والرسائل من الإدارة"
          badge={notificationsBadge}
          icon={
            <svg {...ICON_PROPS}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          }
        />

        <AccountHubCard
          href="/account/profile"
          title="الملف الشخصي"
          description="الاسم، الجوال، الصورة الرمزية، والعنوان الافتراضي"
          badge={profileBadge}
          icon={
            <svg {...ICON_PROPS}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        <AccountHubCard
          href="/account/addresses"
          title="عناويني"
          description="إدارة عناوين التوصيل المحفوظة"
          icon={
            <svg {...ICON_PROPS}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
          disabled
        />

        <AccountHubCard
          href="/account/security"
          title="الأمان"
          description="كلمة المرور، البريد الإلكتروني، وجلسات الدخول"
          icon={
            <svg {...ICON_PROPS}>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          disabled
        />

        <AccountHubCard
          href="/account/notification-preferences"
          title="تفضيلات الإشعارات"
          description="اختر الإشعارات التي تريد استلامها"
          icon={
            <svg {...ICON_PROPS}>
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          }
          disabled
        />

        <AccountHubCard
          href="/account/support"
          title="الدعم والمساعدة"
          description="أسئلة شائعة، تواصل مباشر، والإبلاغ عن مشكلة"
          icon={
            <svg {...ICON_PROPS}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          disabled
        />

        <AccountHubCard
          href="/account/privacy"
          title="الخصوصية والبيانات"
          description="سياسة الخصوصية، تنزيل بياناتك، وحذف الحساب"
          icon={
            <svg {...ICON_PROPS}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          }
          disabled
        />
      </div>

      {/* منطقة الخطر */}
      <DangerZone />

      {/* Responsive grid */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .account-hub-grid {
              grid-template-columns: 1fr;
            }
            @media (min-width: 640px) {
              .account-hub-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            .account-hub-card:hover:not([aria-disabled="true"]) {
              transform: translateY(-2px);
              border-color: rgba(21,118,212,0.4) !important;
              background-color: rgba(21,118,212,0.04) !important;
            }
          `,
        }}
      />
    </div>
  )
}
