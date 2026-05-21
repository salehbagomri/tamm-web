'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Notification } from '@/lib/types/notification'
import { createClient } from '@/lib/supabase/client'
import { markAsRead, markAllAsRead } from '@/lib/actions/notifications'
import { mapNotification } from '@/lib/utils/notifications'

interface AdminNotificationsListProps {
  userId: string
  initialNotifications: Notification[]
}

export default function AdminNotificationsList({ userId, initialNotifications }: AdminNotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // الاشتراك الفوري بالتنبيهات للمدير
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`admin-notifications-page-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const mapped = mapNotification(payload.new)
            setNotifications((prev) => [mapped, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const mapped = mapNotification(payload.new)
            setNotifications((prev) =>
              prev.map((n) => (n.id === mapped.id ? mapped : n))
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const handleMarkAllAsRead = async () => {
    setLoading(true)
    const res = await markAllAsRead()
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }
    setLoading(false)
  }

  const getIcon = (type: string, notificationType?: string | null) => {
    // أيقونات المخزون (تعتمد على notificationType)
    if (notificationType === 'low_stock') return '⚠️'
    if (notificationType === 'out_of_stock') return '🔴'
    switch (type) {
      case 'new_order':
      case 'order_update':
        return '📦'
      case 'quote_sent':
      case 'quote_response':
      case 'new_quote_request':
        return '📄'
      case 'payment_receipt':
        return '💳'
      default:
        return '🔔'
    }
  }

  const formatArabicDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'الآن'
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`
      if (diffHours < 24) return `منذ ${diffHours} ساعة`
      if (diffDays === 1) return 'أمس'
      if (diffDays === 2) return 'قبل يومين'
      if (diffDays < 7) return `منذ ${diffDays} أيام`

      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return ''
    }
  }

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id)
    }
    if (notif.orderId) {
      router.push(`/admin/orders/${notif.orderId}`)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div>
      {/* العنوان وأزرار التحكم */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            🔔 الإشعارات الواردة
          </h1>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
            {unreadCount > 0 ? `لديك ${unreadCount} إشعار جديد بحاجة لمتابعة` : 'لا توجد إشعارات جديدة غير مقروءة'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--blue-light)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface2)'
              e.currentTarget.style.borderColor = 'var(--blue-primary)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {loading ? 'جاري التحديد...' : 'تحديد الكل كمقروء'}
          </button>
        )}
      </div>

      {/* قائمة التنبيهات الإدارية */}
      {notifications.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'var(--text-second)',
        }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🔔</span>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            لوحة الإشعارات نظيفة تماماً
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--text-faint)' }}>
            ستظهر هنا التنبيهات المتعلقة بالطلبات الجديدة وعمليات الدفع وعروض الأسعار فور حدوثها.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              style={{
                backgroundColor: notif.isRead ? 'var(--bg-surface)' : 'rgba(62,158,245,0.06)',
                border: `1px solid ${notif.isRead ? 'var(--border)' : 'var(--blue-primary)'}`,
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* شارة غير مقروء للمدير */}
              {!notif.isRead && (
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--blue-light)',
                  boxShadow: '0 0 8px var(--blue-light)',
                }} />
              )}

              {/* الأيقونة */}
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                flexShrink: 0,
                border: '1px solid var(--border)',
              }}>
                {getIcon(notif.type, notif.notificationType)}
              </div>

              {/* المحتوى */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <h4 style={{
                    margin: '0 0 0.35rem 0',
                    fontSize: '1rem',
                    fontWeight: notif.isRead ? 600 : 700,
                    color: 'var(--text-primary)',
                  }}>
                    {notif.title}
                  </h4>
                </div>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.875rem',
                  color: 'var(--text-second)',
                  lineHeight: '1.6',
                }}>
                  {notif.body}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-faint)',
                  }}>
                    {formatArabicDate(notif.createdAt)}
                  </span>
                  {notif.orderId && (
                    <>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-faint)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--blue-light)', fontWeight: 600 }}>
                        رقم الطلب: #{notif.orderId.slice(0, 8)}...
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
