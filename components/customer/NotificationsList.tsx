'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Notification } from '@/lib/types/notification'
import { createClient } from '@/lib/supabase/client'
import { markAsRead, markAllAsRead } from '@/lib/actions/notifications'
import { mapNotification } from '@/lib/utils/notifications'

interface NotificationsListProps {
  userId: string
  initialNotifications: Notification[]
}

export default function NotificationsList({ userId, initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // اشتراك فوري بالتنبيهات الجديدة
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`notifications-page-${userId}`)
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
    // تحديث الحالة محلياً للمظهر الفوري السريع
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

  const getIcon = (type: string) => {
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
      router.push(`/orders/${notif.orderId}`)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div>
      {/* العنوان والتحكم */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            🔔 التنبيهات
          </h1>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
            {unreadCount > 0 ? `لديك ${unreadCount} تنبيهات غير مقروءة` : 'لا توجد تنبيهات جديدة'}
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

      {/* قائمة التنبيهات */}
      {notifications.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'var(--text-second)',
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔔</span>
          <p style={{ margin: 0, fontWeight: 500 }}>صندوق التنبيهات فارغ تماماً</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              style={{
                backgroundColor: notif.isRead ? 'var(--bg-surface)' : 'rgba(21,118,212,0.06)',
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
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* شارة غير مقروء */}
              {!notif.isRead && (
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--blue-primary)',
                }} />
              )}

              {/* الأيقونة */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}>
                {getIcon(notif.type)}
              </div>

              {/* المحتوى */}
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 0.35rem 0',
                  fontSize: '0.95rem',
                  fontWeight: notif.isRead ? 600 : 700,
                  color: 'var(--text-primary)',
                }}>
                  {notif.title}
                </h4>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.875rem',
                  color: 'var(--text-second)',
                  lineHeight: '1.5',
                }}>
                  {notif.body}
                </p>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-faint)',
                }}>
                  {formatArabicDate(notif.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
