'use client'

import { useState } from 'react'
import ServiceCard from '@/components/customer/services/ServiceCard'
import type { GroupedServices } from '@/lib/data/services'

const TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'ac', label: '❄️ تكييف' },
  { key: 'solar', label: '☀️ طاقة شمسية' },
]

export default function ServiceCategoryTabs({ grouped }: { grouped: GroupedServices }) {
  const [active, setActive] = useState<'all' | 'ac' | 'solar'>('all')
  const services = grouped[active]

  return (
    <>
      {/* التبويبات */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '2rem',
        overflowX: 'auto', paddingBottom: '0.25rem',
      }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActive(tab.key as typeof active)}
            style={{
              padding: '0.625rem 1.5rem', borderRadius: '999px',
              border: '1px solid',
              borderColor: active === tab.key ? 'var(--blue-primary)' : 'var(--border)',
              backgroundColor: active === tab.key ? 'rgba(21,118,212,0.12)' : 'var(--bg-surface)',
              color: active === tab.key ? 'var(--blue-light)' : 'var(--text-second)',
              fontWeight: active === tab.key ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>
            {tab.label}
            <span style={{
              marginRight: '0.375rem', fontSize: '0.8rem',
              color: active === tab.key ? 'var(--blue-sky)' : 'var(--text-faint)',
            }}>
              ({grouped[tab.key as typeof active].length})
            </span>
          </button>
        ))}
      </div>

      {/* الخدمات */}
      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-faint)' }}>
          لا توجد خدمات في هذه الفئة
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </>
  )
}
