import Image from 'next/image'
import type { UserProfile } from '@/lib/types/user'

interface AccountIdentityCardProps {
  profile: UserProfile
}

export default function AccountIdentityCard({ profile }: AccountIdentityCardProps) {
  const initial = profile.fullName?.charAt(0)?.toUpperCase() ?? '؟'
  const joinDate = new Date(profile.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
  })
  const isComplete = profile.isComplete

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '1.75rem 1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Subtle blue glow background */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          insetInlineStart: '-60px',
          top: '-60px',
          width: '180px',
          height: '180px',
          background:
            'radial-gradient(circle at center, rgba(21,118,212,0.18), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          position: 'relative',
        }}
      >
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {profile.avatarUrl ? (
            <div
              style={{
                width: '78px',
                height: '78px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--blue-primary)',
              }}
            >
              <Image
                src={profile.avatarUrl}
                alt={profile.fullName}
                width={78}
                height={78}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '78px',
                height: '78px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#fff',
                border: '3px solid var(--border)',
                boxShadow: '0 0 0 4px rgba(21,118,212,0.2)',
              }}
            >
              {initial}
            </div>
          )}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: '2px',
              left: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              border: '2px solid var(--bg-surface)',
            }}
          />
        </div>

        {/* Identity text */}
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
              }}
            >
              {profile.fullName || 'عميل'}
            </h1>
            <span
              style={{
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                backgroundColor: isComplete
                  ? 'rgba(34,201,138,0.14)'
                  : 'rgba(245,158,11,0.18)',
                color: isComplete ? '#16a34a' : '#a16207',
                fontSize: '0.7rem',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {isComplete ? '✓ مكتمل' : '⚠️ مكتمل جزئياً'}
            </span>
          </div>
          <p
            style={{
              margin: '0.3rem 0 0',
              fontSize: '0.875rem',
              color: 'var(--text-second)',
              wordBreak: 'break-all',
            }}
          >
            {profile.email}
          </p>
          <p
            style={{
              margin: '0.3rem 0 0',
              fontSize: '0.8rem',
              color: 'var(--text-faint)',
            }}
          >
            عضو منذ {joinDate}
          </p>
        </div>
      </div>
    </div>
  )
}
