'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'الداشبورد',      path: '/admin/dashboard',    icon: '📊' },
  { label: 'الطلبات',        path: '/admin/orders',        icon: '📋', countKey: 'pendingOrders' },
  { label: 'عروض الأسعار',   path: '/admin/quotes',        icon: '💬', countKey: 'pendingQuotes' },
  { label: 'العروض',         path: '/admin/promotions',    icon: '🌟' },
  { label: 'المنتجات',       path: '/admin/products',      icon: '📦' },
  { label: 'الخدمات',        path: '/admin/services',      icon: '🔧' },
  { label: 'الفنيون',        path: '/admin/technicians',   icon: '👷' },
]

interface AdminSidebarProps {
  managerName?: string | null
  pendingOrders?: number
  pendingQuotes?: number
}

export default function AdminSidebar({
  managerName,
  pendingOrders = 0,
  pendingQuotes = 0,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const counts: Record<string, number> = { pendingOrders, pendingQuotes }

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
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>⚙</div>
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
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
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
