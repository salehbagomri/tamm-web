'use client'

import { useState } from 'react'
import type { Order } from '@/lib/types/order'
import OrderCard from '@/components/customer/orders/OrderCard'
import Link from 'next/link'

type TabKey = 'all' | 'active' | 'completed' | 'cancelled'

export default function OrdersTabs({ initialOrders }: { initialOrders: Order[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const filteredOrders = initialOrders.filter((order) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress'].includes(order.status)
    if (activeTab === 'completed') return order.status === 'completed'
    if (activeTab === 'cancelled') return order.status === 'cancelled'
    return true
  })

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'active', label: 'نشطة' },
    { key: 'completed', label: 'مكتملة' },
    { key: 'cancelled', label: 'ملغية' },
  ]

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {TABS.map((tab) => {
          const count = tab.key === 'all' 
            ? initialOrders.length 
            : initialOrders.filter((o) => {
                if (tab.key === 'active') return ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress'].includes(o.status)
                return o.status === tab.key
              }).length

          const isActive = activeTab === tab.key

          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.625rem 1.25rem', borderRadius: '999px',
                backgroundColor: isActive ? 'rgba(21,118,212,0.1)' : 'var(--bg-surface)',
                border: `1px solid ${isActive ? 'var(--blue-primary)' : 'var(--border)'}`,
                color: isActive ? 'var(--blue-light)' : 'var(--text-second)',
                fontWeight: isActive ? 600 : 400, fontSize: '0.9rem',
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem',
                whiteSpace: 'nowrap',
              }}>
              {tab.label}
              <span style={{
                padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.75rem',
                backgroundColor: isActive ? 'var(--blue-primary)' : 'var(--bg-surface2)',
                color: isActive ? '#fff' : 'var(--text-faint)',
              }}>{count}</span>
            </button>
          )
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>لا توجد طلبات هنا</h2>
          <p style={{ color: 'var(--text-second)', marginBottom: '1.5rem' }}>لم تقم بأي طلبات تطابق هذا التصنيف بعد.</p>
          <Link href="/store" style={{
            padding: '0.875rem 2rem', borderRadius: '10px',
            backgroundColor: 'var(--blue-primary)', color: '#fff',
            fontWeight: 700, textDecoration: 'none', display: 'inline-block'
          }}>تصفح المتجر</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredOrders.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </>
  )
}
