import type { Notification } from '@/lib/types/notification'

export function mapNotification(raw: any): Notification {
  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    body: raw.body,
    type: raw.type,
    notificationType: raw.notification_type ?? null,
    data: raw.data ?? null,
    orderId: raw.order_id ?? null,
    isRead: raw.is_read ?? false,
    createdAt: raw.created_at,
  }
}
