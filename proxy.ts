import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/auth'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // تجاوز الحماية إذا لم تُضَف مفاتيح Supabase بعد (بيئة التطوير)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return response
  }

  const supabase = createMiddlewareClient(request, response)

  // تحديث الجلسة وقراءة المستخدم الحالي
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // ── الجذر: توجيه حسب الجلسة والدور ──
  if (path === '/') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const role = await getUserRole(supabase, user.id)
    if (role === 'manager') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // ── مسارات المصادقة: إذا جلسة موجودة → وجّه بعيداً ──
  if (path.startsWith('/login') || path.startsWith('/register')) {
    if (user) {
      const role = await getUserRole(supabase, user.id)
      if (role === 'manager') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return response
  }

  // ── مسارات Admin ──
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const role = await getUserRole(supabase, user.id)
    if (role !== 'manager') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return response
  }

  // ── مسارات Customer ──
  if (
    path.startsWith('/home') ||
    path.startsWith('/store') ||
    path.startsWith('/services') ||
    (path.startsWith('/orders') && !path.startsWith('/admin')) ||
    path.startsWith('/profile')
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const role = await getUserRole(supabase, user.id)
    if (role === 'manager') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * يطبق على كل المسارات عدا:
     * - _next/static (ملفات ثابتة)
     * - _next/image (تحسين الصور)
     * - favicon.ico
     * - ملفات public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
