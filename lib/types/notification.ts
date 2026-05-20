export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: string
  notificationType: string | null
  data: Record<string, any> | null
  orderId: string | null
  isRead: boolean
  createdAt: string
}
