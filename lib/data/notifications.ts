import { createServerClient } from '@/lib/supabase/server'
import type { Notification } from '@/lib/types/notification'
import { mapNotification } from '@/lib/utils/notifications'

// جلب إشعارات المستخدم
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as any[]).map(mapNotification)
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    return []
  }
}

// جلب عدد الإشعارات غير المقروءة للمستخدم
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const supabase = await createServerClient()
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return count ?? 0
  } catch (error) {
    console.error('Error fetching unread notifications count:', error)
    return 0
  }
}
