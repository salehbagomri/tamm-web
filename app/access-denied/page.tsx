import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

import { signOut } from '@/lib/actions/auth'

export const metadata = { title: 'عذراً، غير مصرح لك — تمّ' }

export default async function AccessDeniedPage() {
  const supabase = await createServerClient()
  await supabase.auth.getUser()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
      padding: '2rem', textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '24px', padding: '3rem 2rem', maxWidth: '420px', width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 1rem', color: 'var(--error)' }}>
          عفواً! هذا الحساب لفني
        </h1>
        <p style={{ color: 'var(--text-second)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '1rem' }}>
          أنت تستخدم حساب <strong>فني</strong>.<br />
          لوحة تحكم الفنيين متوفرة حصرياً عبر تطبيق الهاتف المخصص، وليست عبر موقع الويب.
        </p>
        
        <form action={signOut}>
          <button type="submit" style={{
            width: '100%', padding: '0.875rem', borderRadius: '12px',
            backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
          }}>
            تسجيل الخروج
          </button>
        </form>
      </div>
    </div>
  )
}
