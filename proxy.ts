import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/auth'

// المسارات المتاحة بدون تسجيل دخول (Guest Mode)
const PUBLIC_PATHS = ['/', '/home', '/store', '/services', '/login', '/register', '/forgot-password', '/reset-password', '/auth']

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'))
}

// المسارات التي تتطلب تسجيل دخول
const PROTECTED_PATHS = ['/orders', '/profile', '/cart']

function isProtectedCustomerPath(path: string): boolean {
  return PROTECTED_PATHS.some((p) => path === p || path.startsWith(p + '/'))
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // تجاوز الحماية إذا لم تُضَف مفاتيح Supabase بعد
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return response
  }

  const supabase = createMiddlewareClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // ── مسارات Auth: إذا جلسة موجودة → وجّه حسب الدور ──
  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')
  ) {
    if (user) {
      const role = await getUserRole(supabase, user.id)
      if (role === 'manager') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return response
  }

  // ── مسارات Admin: تتطلب دور manager ──
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const role = await getUserRole(supabase, user.id)
    if (role !== 'manager') return NextResponse.redirect(new URL('/home', request.url))
    return response
  }

  // ── مسارات Customer المحمية: تتطلب تسجيل دخول ──
  if (isProtectedCustomerPath(path)) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const role = await getUserRole(supabase, user.id)
    if (role === 'manager') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    return response
  }

  // ── الجذر: وجّه للـ home دائماً ──
  if (path === '/') {
    if (user) {
      const role = await getUserRole(supabase, user.id)
      if (role === 'manager') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
