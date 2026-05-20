'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// تحديد التنبيه كمقروء
export async function markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'يجب تسجيل الدخول أولاً' }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/notifications')
    revalidatePath('/admin/notifications')
    return { success: true }
  } catch (error: any) {
    console.error('Error marking notification as read:', error.message)
    return { success: false, error: error.message }
  }
}

// تحديد جميع التنبيهات كمقروءة للمستخدم الحالي
export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'يجب تسجيل الدخول أولاً' }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) throw error

    revalidatePath('/notifications')
    revalidatePath('/admin/notifications')
    return { success: true }
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error.message)
    return { success: false, error: error.message }
  }
}

// ─── دوال إرسال الإشعارات بالخلفية ──────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/server'

export async function sendNotification({
  userId,
  title,
  body,
  type,
  notificationType,
  orderId,
  data = {},
}: {
  userId: string
  title: string
  body: string
  type: string
  notificationType?: string
  orderId?: string | null
  data?: Record<string, any>
}) {
  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        type,
        notification_type: notificationType || type,
        order_id: orderId || null,
        data: data || {},
        is_read: false,
      })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error sending notification:', error.message)
    return { success: false, error: error.message }
  }
}

export async function notifyManagers({
  title,
  body,
  type,
  notificationType,
  orderId,
  data = {},
}: {
  title: string
  body: string
  type: string
  notificationType?: string
  orderId?: string | null
  data?: Record<string, any>
}) {
  try {
    const admin = createAdminClient()
    const { data: managers, error } = await admin
      .from('profiles')
      .select('id')
      .eq('role', 'manager')

    if (error) throw error

    if (managers && managers.length > 0) {
      const inserts = managers.map((m) => ({
        user_id: m.id,
        title,
        body,
        type,
        notification_type: notificationType || type,
        order_id: orderId || null,
        data: data || {},
        is_read: false,
      }))

      const { error: insertErr } = await admin.from('notifications').insert(inserts)
      if (insertErr) throw insertErr
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error notifying managers:', error.message)
    return { success: false, error: error.message }
  }
}
