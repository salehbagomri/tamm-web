'use server'

import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const AVATARS_BUCKET = 'avatars'
const MAX_SIZE = 2 * 1024 * 1024 // 2 ميجا (الـ bucket يقبل 5 لكن نحدّ التطبيق إلى 2)
const ALLOWED = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

type Result = { success: true; avatarUrl: string } | { error: string }

export async function uploadAvatar(formData: FormData): Promise<Result> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

  const file = formData.get('file')
  if (!(file instanceof File)) return { error: 'لم يتم اختيار ملف' }
  if (file.size === 0) return { error: 'الملف فارغ' }
  if (file.size > MAX_SIZE) return { error: 'حجم الصورة يجب أن يكون أقل من 2 ميجا' }
  if (!ALLOWED.has(file.type)) return { error: 'نوع الملف غير مسموح — JPEG أو PNG أو WebP فقط' }

  // المسار الثابت: avatars/{userId}/avatar.jpg — يُحدَّث مع كل رفع
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${user.id}/avatar.${ext}`

  // تنظيف الملفات القديمة بامتدادات مختلفة (لتجنّب ملفات يتيمة)
  const admin = createAdminClient()
  try {
    const { data: existing } = await admin.storage.from(AVATARS_BUCKET).list(user.id)
    const toDelete = (existing ?? [])
      .filter(f => f.name.startsWith('avatar.') && f.name !== `avatar.${ext}`)
      .map(f => `${user.id}/${f.name}`)
    if (toDelete.length > 0) {
      await admin.storage.from(AVATARS_BUCKET).remove(toDelete)
    }
  } catch {
    // التنظيف اختياري — لا نوقف الرفع إن فشل
  }

  const { error: uploadErr } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' })

  if (uploadErr) {
    console.error('[uploadAvatar]', uploadErr)
    return { error: 'فشل رفع الصورة، يرجى المحاولة مرة أخرى' }
  }

  // الرابط العام + cache-buster بـ timestamp ليتحدّث الـ <img> فوراً
  const { data: pub } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path)
  const avatarUrl = `${pub.publicUrl}?v=${Date.now()}`

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (updateErr) {
    console.error('[uploadAvatar update profile]', updateErr)
    return { error: 'تم رفع الصورة لكن فشل حفظها في الملف الشخصي' }
  }

  revalidatePath('/account')
  revalidatePath('/account/profile')
  revalidatePath('/', 'layout')

  return { success: true, avatarUrl }
}

export async function removeAvatar(): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

  const admin = createAdminClient()
  try {
    const { data: existing } = await admin.storage.from(AVATARS_BUCKET).list(user.id)
    const paths = (existing ?? [])
      .filter(f => f.name.startsWith('avatar.'))
      .map(f => `${user.id}/${f.name}`)
    if (paths.length > 0) {
      await admin.storage.from(AVATARS_BUCKET).remove(paths)
    }
  } catch (err) {
    console.error('[removeAvatar storage]', err)
  }

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id)

  if (updateErr) {
    console.error('[removeAvatar update profile]', updateErr)
    return { error: 'فشل حذف الصورة الرمزية' }
  }

  revalidatePath('/account')
  revalidatePath('/account/profile')
  revalidatePath('/', 'layout')

  return { success: true }
}
