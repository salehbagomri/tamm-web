'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import type { UserProfile } from '@/lib/types/user'
import { signOut } from '@/lib/actions/auth'
import { useCart } from '@/lib/store/cart-context'
import { createClient } from '@/lib/supabase/client'
import TammLogo from '@/components/ui/TammLogo'

const NAV_LINKS = [
  { href: '/home', label: 'الرئيسية' },
  { href: '/store', label: 'المتجر' },
  { href: '/services', label: 'الخدمات' },
]

interface CustomerNavbarProps {
  user: UserProfile | null
}

export default function CustomerNavbar({ user }: CustomerNavbarProps) {
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { totalItems } = useCart()
  const [unreadCount, setUnreadCount] = useState(0)

  // جلب وتحديث الإشعارات غير المقروءة فوريًا
  useEffect(() => {
    if (!user) return
    const userId = user.id

    const supabase = createClient()

    async function fetchUnreadCount() {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (!error && count !== null) {
        setUnreadCount(count)
      }
    }

    fetchUnreadCount()

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // تأثير التمرير
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // إغلاق الـ dropdown عند الضغط خارجه
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // إغلاق mobile menu عند تغيير المسار
  useEffect(() => setIsMobileOpen(false), [pathname])

  const initials = user?.fullName?.slice(0, 1) ?? '؟'

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: isScrolled ? 'rgba(13,24,37,0.95)' : 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        transition: 'background-color 0.3s',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 1.5rem', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1.5rem',
        }}>
          {/* الشعار */}
          <Link href="/home" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            textDecoration: 'none', flexShrink: 0,
          }}>
            <TammLogo size={36} />
            <span style={{
              fontWeight: 800, fontSize: '1.375rem',
              background: 'linear-gradient(135deg, var(--blue-light), var(--blue-sky))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              تمّ
            </span>
          </Link>

          {/* روابط الديسكتوب */}
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
            className="desktop-nav">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: '0.5rem 1rem', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-second)',
                  textDecoration: 'none',
                  backgroundColor: active ? 'rgba(21,118,212,0.12)' : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* أيقونات اليسار */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {/* أيقونة الإشعارات */}
            {user && (
              <Link href="/notifications" style={{
                position: 'relative', color: 'var(--text-second)',
                textDecoration: 'none', display: 'flex', padding: '0.5rem',
                borderRadius: '8px', transition: 'color 0.15s',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '2px', left: '2px',
                    minWidth: '18px', height: '18px', borderRadius: '999px',
                    backgroundColor: 'var(--error)', color: '#fff',
                    fontSize: '0.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* أيقونة السلة */}
            <Link href={user ? '/cart' : '/login'} style={{
              position: 'relative', color: 'var(--text-second)',
              textDecoration: 'none', display: 'flex', padding: '0.5rem',
              borderRadius: '8px', transition: 'color 0.15s',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: '2px', left: '2px',
                  minWidth: '18px', height: '18px', borderRadius: '999px',
                  backgroundColor: 'var(--blue-primary)', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* مستخدم مسجل */}
            {user ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.375rem 0.75rem 0.375rem 0.375rem',
                    backgroundColor: 'var(--bg-surface2)',
                    border: '1px solid var(--border)', borderRadius: '999px',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                  }}
                >
                  {/* الصورة أو الأحرف الأولى */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: 'var(--blue-mid)', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.fullName} width={32} height={32} style={{ objectFit: 'cover' }} />
                    ) : initials}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.fullName}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"
                    style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute', left: 0, top: 'calc(100% + 8px)',
                    minWidth: '180px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)', borderRadius: '12px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                    overflow: 'hidden', zIndex: 200,
                  }}>
                    {[
                      { href: '/profile', label: 'حسابي', icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      )},
                      { href: '/orders', label: 'طلباتي', icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                          <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
                        </svg>
                      )},
                    ].map((item) => (
                      <Link key={item.href} href={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.625rem',
                          padding: '0.75rem 1rem', textDecoration: 'none',
                          color: 'var(--text-primary)', fontSize: '0.9rem',
                          transition: 'background-color 0.15s',
                        }}>
                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-second)' }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.25rem 0' }} />
                    <form action={signOut}>
                      <button type="submit" style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.75rem 1rem', textAlign: 'right',
                        backgroundColor: 'transparent', border: 'none',
                        color: 'var(--error)', fontSize: '0.9rem', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                        </span>
                        <span>تسجيل الخروج</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              /* زائر */
              <Link href="/login" style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px',
                backgroundColor: 'var(--blue-primary)', color: '#fff',
                fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}>
                تسجيل الدخول
              </Link>
            )}

            {/* Hamburger للموبايل */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                backgroundColor: 'transparent', border: 'none',
                color: 'var(--text-second)', cursor: 'pointer', padding: '0.5rem',
              }}
            >
              {isMobileOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            padding: '1rem 1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem',
          }}
            className="mobile-menu">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: '0.75rem 1rem', borderRadius: '8px',
                  color: active ? 'var(--blue-light)' : 'var(--text-second)',
                  fontWeight: active ? 600 : 400, textDecoration: 'none',
                  backgroundColor: active ? 'rgba(21,118,212,0.1)' : 'transparent',
                }}>
                  {link.label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* CSS للاستجابة */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
