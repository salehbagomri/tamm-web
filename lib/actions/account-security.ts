'use server'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ترجمة أخطاء Supabase للعربية في سياق إعدادات الأمان
function mapError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials') || m.includes('invalid password')) {
    return 'كلمة المرور الحالية غير صحيحة'
  }
  if (m.includes('password should be at least') || m.includes('weak password')) {
    return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي حرفاً ورقماً'
  }
  if (m.includes('new password should be different') || m.includes('same password')) {
    return 'كلمة المرور الجديدة يجب أن تختلف عن الحالية'
  }
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'هذا البريد الإلكتروني مستخدم بحساب آخر'
  }
  if (m.includes('unable to validate email') || m.includes('invalid email')) {
    return 'صيغة البريد الإلكتروني غير صحيحة'
  }
  if (m.includes('email_change') && m.includes('same email')) {
    return 'البريد الجديد يطابق بريدك الحالي'
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'كثرة المحاولات، يرجى الانتظار قليلاً'
  }
  return 'حدث خطأ، يرجى المحاولة مرة أخرى'
}

// التحقق من كلمة المرور الحالية بدون التأثير على الـ session الحالية للمستخدم
// (نستخدم client مستقل بدون cookies حتى لا تتداخل الجلسات)
async function verifyCurrentPassword(email: string, password: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const verifyClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await verifyClient.auth.signInWithPassword({ email, password })
  return !error
}

function isStrongPassword(p: string): boolean {
  return p.length >= 8 && /[A-Za-z]/.test(p) && /[0-9]/.test(p)
}

// ─── تغيير كلمة المرور ──────────────────────────────────────────────────────

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return { error: 'يجب تسجيل الدخول أولاً' }

  if (!currentPassword) return { error: 'يرجى إدخال كلمة المرور الحالية' }
  if (!isStrongPassword(newPassword)) {
    return { error: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل وتحتوي حرفاً ورقماً' }
  }
  if (currentPassword === newPassword) {
    return { error: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية' }
  }

  const ok = await verifyCurrentPassword(user.email, currentPassword)
  if (!ok) return { error: 'كلمة المرور الحالية غير صحيحة' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: mapError(error.message) }

  revalidatePath('/account/security')
  return { success: true }
}

// ─── تغيير البريد الإلكتروني ────────────────────────────────────────────────

export async function changeEmail(
  newEmail: string,
  currentPassword: string,
): Promise<{ success: true; emailSent: true } | { error: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return { error: 'يجب تسجيل الدخول أولاً' }

  const cleanEmail = newEmail.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: 'صيغة البريد الإلكتروني غير صحيحة' }
  }
  if (cleanEmail === user.email.toLowerCase()) {
    return { error: 'البريد الجديد يطابق بريدك الحالي' }
  }
  if (!currentPassword) return { error: 'يرجى إدخال كلمة المرور للتأكيد' }

  const ok = await verifyCurrentPassword(user.email, currentPassword)
  if (!ok) return { error: 'كلمة المرور غير صحيحة' }

  const { error } = await supabase.auth.updateUser({ email: cleanEmail })
  if (error) return { error: mapError(error.message) }

  // Supabase يرسل رابط تأكيد للبريد الجديد. التغيير لا يكتمل إلا بعد الضغط على الرابط.
  return { success: true, emailSent: true }
}

// ─── تسجيل الخروج من كل الأجهزة ─────────────────────────────────────────────

export async function signOutAllDevices(): Promise<void> {
  const supabase = await createServerClient()
  await supabase.auth.signOut({ scope: 'global' })
  redirect('/login')
}
