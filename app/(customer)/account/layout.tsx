import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '1.75rem 1.25rem 3rem',
      }}
    >
      {children}
    </div>
  )
}
