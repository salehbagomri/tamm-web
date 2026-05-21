'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TammLogo from '@/components/ui/TammLogo'

type NavItem = { label: string; path: string; icon: React.ReactNode; countKey?: string }

const navItems: NavItem[] = [
  {
    label: 'الداشبورد', path: '/admin/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'التقارير المالية', path: '/admin/reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
  {
    label: 'الطلبات', path: '/admin/orders', countKey: 'pendingOrders',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    label: 'عروض الأسعار', path: '/admin/quotes', countKey: 'pendingQuotes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'الإشعارات', path: '/admin/notifications', countKey: 'unreadNotifications',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    label: 'العروض', path: '/admin/promotions',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
        <path d="M12 22V7m0-5a3 3 0 0 1 3 3H9a3 3 0 0 1 3-3z"/>
      </svg>
    ),
  },
  {
    label: 'المنتجات', path: '/admin/products',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
      </svg>
    ),
  },
  {
    label: 'الخدمات', path: '/admin/services',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    label: 'الفنيون', path: '/admin/technicians',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'مستحقات الفنيين', path: '/admin/technicians/earnings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    label: 'قواعد العمولة', path: '/admin/settings/commissions',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

interface AdminSidebarProps {
  managerId?: string
  managerName?: string | null
  pendingOrders?: number
  pendingQuotes?: number
  unreadNotifications?: number
}

export default function AdminSidebar({
  managerId,
  managerName,
  pendingOrders = 0,
  pendingQuotes = 0,
  unreadNotifications = 0,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadNotifications)

  // مزامنة القيمة الآتية من السيرفر
  useEffect(() => {
    setLocalUnreadCount(unreadNotifications)
  }, [unreadNotifications])

  // الاشتراك الفوري في تنبيهات المدير
  useEffect(() => {
    if (!managerId) return

    async function fetchUnreadCount() {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', managerId)
        .eq('is_read', false)

      if (!error && count !== null) {
        setLocalUnreadCount(count)
      }
    }

    const channel = supabase
      .channel(`manager-notifications-${managerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${managerId}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [managerId, supabase])

  const counts: Record<string, number> = {
    pendingOrders,
    pendingQuotes,
    unreadNotifications: localUnreadCount,
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* الشعار */}
      <div style={{
        padding: '1.5rem 1.25rem 1.25rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <TammLogo size={36} variant="light" />
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--blue-light)' }}>
              تمّ
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-faint)' }}>
              لوحة المدير
            </p>
          </div>
        </div>
      </div>

      {/* التنقل */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
          const count = item.countKey ? counts[item.countKey] : 0

          return (
            <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6875rem 0.875rem',
                borderRadius: '10px',
                textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(21,118,212,0.12)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(21,118,212,0.25)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
              <span style={{
                display: 'flex', alignItems: 'center',
                color: isActive ? 'var(--blue-light)' : 'var(--text-second)',
              }}>
                {item.icon}
              </span>
              <span style={{
                flex: 1, fontSize: '0.9rem', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--blue-light)' : 'var(--text-second)',
              }}>
                {item.label}
              </span>
              {count > 0 && (
                <span style={{
                  minWidth: '22px', height: '22px', padding: '0 5px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--warning)',
                  color: '#fff',
                  fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* أسفل السايدبار: المدير + تسجيل الخروج */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>
            م
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {managerName ?? 'المدير'}
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-faint)' }}>مدير النظام</p>
          </div>
        </div>

        <button onClick={handleSignOut} style={{
          width: '100%', padding: '0.5rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(224,82,82,0.08)',
          border: '1px solid rgba(224,82,82,0.2)',
          color: 'var(--error)', fontSize: '0.8125rem',
          fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
        }}>
          🚪 تسجيل الخروج
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop Sidebar — دائماً مرئي */}
      <div className="admin-sidebar-desktop">
        <SidebarContent />
      </div>

      {/* Mobile — زر Hamburger */}
      <div className="admin-sidebar-mobile-trigger" style={{
        position: 'fixed', top: '1rem', right: '1rem',
        zIndex: 1000,
        display: 'none',
      }}>
        <button onClick={() => setMobileOpen(true)} style={{
          width: '44px', height: '44px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          ☰
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          {/* Backdrop */}
          <div onClick={() => setMobileOpen(false)} style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
          }} />
          {/* Drawer */}
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <SidebarContent />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-sidebar-mobile-trigger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .admin-sidebar-mobile-trigger { display: none !important; }
        }
      `}</style>
    </>
  )
}
