'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/auth'

// ترجمة أخطاء Supabase للعربية
function mapError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  if (message.includes('Email not confirmed'))
    return 'يرجى تأكيد بريدك الإلكتروني أولاً'
  if (message.includes('already registered') || message.includes('already been registered'))
    return 'البريد الإلكتروني مستخدم بالفعل'
  if (message.includes('Password should be at least'))
    return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
  if (message.includes('Unable to validate email') || message.includes('invalid email'))
    return 'البريد الإلكتروني غير صحيح'
  if (message.includes('rate limit') || message.includes('too many'))
    return 'كثرة المحاولات، يرجى الانتظار قليلاً'
  return 'حدث خطأ، يرجى المحاولة مرة أخرى'
}

// تسجيل الدخول بالبريد وكلمة المرور
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error: string }> {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: mapError(error.message) }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'حدث خطأ أثناء تسجيل الدخول' }

  const role = await getUserRole(supabase, user.id)
  if (role === 'manager') redirect('/admin/dashboard')
  redirect('/home')
}

// إنشاء حساب جديد بالبريد
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<{ error: string; emailSent?: boolean }> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })

  if (error) return { error: mapError(error.message) }

  // إذا كان تأكيد البريد مطلوباً
  if (data.user && !data.session) {
    return { error: '', emailSent: true }
  }

  redirect('/home')
}

// إرسال رابط استعادة كلمة المرور
export async function resetPassword(
  email: string
): Promise<{ error: string | null; success?: boolean }> {
  const supabase = await createServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) return { error: mapError(error.message) }
  return { error: null, success: true }
}

// تحديث كلمة المرور الجديدة
export async function updatePassword(
  newPassword: string
): Promise<{ error: string | null }> {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: mapError(error.message) }
  redirect('/home')
}

// تسجيل الخروج
export async function signOut(): Promise<void> {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
