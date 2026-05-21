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
const PROTECTED_PATHS = ['/orders', '/profile', '/checkout', '/quote-request', '/order-success']

function isProtectedCustomerPath(path: string): boolean {
  if (PROTECTED_PATHS.some((p) => path === p || path.startsWith(p + '/'))) return true
  // حجز الخدمة يتطلب تسجيل دخول
  if (/^\/services\/[^/]+\/book/.test(path)) return true
  return false
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

  // ── مسارات Auth: إذا جلسة موجودة → وجّه حسب الدور والإتمام ──
  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')
  ) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_complete')
        .eq('id', user.id)
        .single()
      if (!profile?.is_complete) return NextResponse.redirect(new URL('/onboarding', request.url))
      if (profile.role === 'manager') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      if (profile.role === 'technician') return NextResponse.redirect(new URL('/access-denied', request.url))
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return response
  }

  // ── /onboarding: تتطلب جلسة نشطة + is_complete=false ──
  if (path.startsWith('/onboarding')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_complete')
      .eq('id', user.id)
      .single()
    if (profile?.is_complete) {
      if (profile.role === 'manager') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      if (profile.role === 'technician') return NextResponse.redirect(new URL('/access-denied', request.url))
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return response
  }

  // ── مسارات Admin: تتطلب دور manager ──
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const role = await getUserRole(supabase, user.id)
    if (role === 'technician') return NextResponse.redirect(new URL('/access-denied', request.url))
    if (role !== 'manager') return NextResponse.redirect(new URL('/home', request.url))
    return response
  }

  // ── مسارات Customer المحمية: تتطلب تسجيل دخول ──
  if (isProtectedCustomerPath(path)) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const role = await getUserRole(supabase, user.id)
    // السماح للمدير بالوصول لصفحة الفاتورة (الصفحة تعالج الصلاحيات داخلياً)
    if (role === 'manager' && /^\/orders\/[^/]+\/invoice/.test(path)) return response
    if (role === 'manager') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    if (role === 'technician') return NextResponse.redirect(new URL('/access-denied', request.url))
    return response
  }

  // ── الجذر: وجّه للـ home دائماً ──
  if (path === '/') {
    if (user) {
      const role = await getUserRole(supabase, user.id)
      if (role === 'manager') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      if (role === 'technician') return NextResponse.redirect(new URL('/access-denied', request.url))
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
