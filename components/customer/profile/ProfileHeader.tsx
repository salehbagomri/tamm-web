import Image from 'next/image'
import type { UserProfile } from '@/lib/types/user'

export default function ProfileHeader({ profile }: { profile: UserProfile }) {
  const initial = profile.fullName?.charAt(0)?.toUpperCase() ?? '؟'
  const joinDate = new Date(profile.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '1rem', padding: '2rem 1.5rem', textAlign: 'center',
      backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '20px',
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        {profile.avatarUrl ? (
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--blue-primary)' }}>
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName}
              width={96}
              height={96}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <div style={{
            width: '96px', height: '96px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.25rem', fontWeight: 700, color: '#fff',
            border: '3px solid var(--border)',
            boxShadow: '0 0 0 4px rgba(21,118,212,0.2)',
          }}>
            {initial}
          </div>
        )}

        {/* Online indicator */}
        <div style={{
          position: 'absolute', bottom: '4px', left: '4px',
          width: '16px', height: '16px', borderRadius: '50%',
          backgroundColor: 'var(--success)', border: '2px solid var(--bg-surface)',
        }} />
      </div>

      {/* الاسم */}
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
          {profile.fullName}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-second)', margin: 0 }}>
          {profile.email}
        </p>
      </div>

      {/* Badge الدور */}
      <span style={{
        padding: '0.3rem 1rem', borderRadius: '999px',
        backgroundColor: 'rgba(21,118,212,0.1)', border: '1px solid rgba(21,118,212,0.3)',
        color: 'var(--blue-light)', fontSize: '0.8125rem', fontWeight: 600,
      }}>
        👤 عميل
      </span>

      {/* تاريخ الانضمام */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: 0 }}>
        عضو منذ {joinDate}
      </p>

      {/* معلومات إضافية */}
      {profile.phone && (
        <div style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0 0 0.2rem' }}>رقم الجوال</p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500, direction: 'ltr', textAlign: 'center' }}>
            {profile.phone}
          </p>
        </div>
      )}
    </div>
  )
}
