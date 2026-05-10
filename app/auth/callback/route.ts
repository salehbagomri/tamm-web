import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/auth'

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
        const role = await getUserRole(supabase, user.id)
        if (role === 'manager') {
          return NextResponse.redirect(new URL('/admin/dashboard', origin))
        }
        return NextResponse.redirect(new URL(next, origin))
      }
    }
  }

  // في حالة الخطأ → صفحة تسجيل الدخول مع رسالة
  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
