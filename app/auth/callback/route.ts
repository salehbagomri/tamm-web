import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// يستقبل OAuth redirect من Supabase ويتبادل الكود بجلسة
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_complete')
          .eq('id', user.id)
          .single()

        if (!profile?.is_complete) return NextResponse.redirect(new URL('/onboarding', origin))
        if (profile.role === 'manager') return NextResponse.redirect(new URL('/admin/dashboard', origin))
        if (profile.role === 'technician') return NextResponse.redirect(new URL('/access-denied', origin))
        return NextResponse.redirect(new URL(next, origin))
      }
    }
  }

  // في حالة الخطأ → صفحة تسجيل الدخول مع رسالة
  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
