'use client'

import { useState } from 'react'
import type { PaymentMethod } from '@/lib/types/payment'

interface Props {
  paymentMethods: PaymentMethod[]
  onChange: (paymentType: 'cash' | 'bank' | 'wallet', paymentMethodId: string | null) => void
}

export default function PaymentMethodSelector({ paymentMethods, onChange }: Props) {
  const [selectedType, setSelectedType] = useState<'cash' | 'bank' | 'wallet'>('cash')
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)

  const banks = paymentMethods.filter((m) => m.type === 'bank')
  const wallets = paymentMethods.filter((m) => m.type === 'wallet')

  function selectType(type: 'cash' | 'bank' | 'wallet') {
    setSelectedType(type)
    setSelectedMethodId(null)
    if (type === 'cash') onChange('cash', null)
  }

  function selectMethod(type: 'bank' | 'wallet', id: string) {
    setSelectedMethodId(id)
    onChange(type, id)
  }

  const SubList = ({ type, items }: { type: 'bank' | 'wallet'; items: PaymentMethod[] }) => (
    <div style={{
      maxHeight: selectedType === type ? `${items.length * 76}px` : '0',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease',
    }}>
      {items.map((m) => (
        <div
          key={m.id}
          onClick={(e) => { e.stopPropagation(); selectMethod(type, m.id) }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0.75rem 1rem 0.75rem 1.25rem',
            borderTop: '1px solid var(--border)',
            cursor: 'pointer',
            backgroundColor: selectedMethodId === m.id ? 'rgba(21,118,212,0.1)' : 'transparent',
            transition: 'background-color 0.15s',
          }}
        >
          <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            {m.name}
          </span>
          {m.accountNumber && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', marginTop: '0.2rem' }}>
              رقم الحساب: {m.accountNumber}
            </span>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
        طريقة الدفع
      </p>

      {/* كاش */}
      <div
        onClick={() => selectType('cash')}
        style={{
          border: `2px solid ${selectedType === 'cash' ? 'var(--blue-primary)' : 'var(--border)'}`,
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: selectedType === 'cash' ? 'rgba(21,118,212,0.06)' : 'var(--bg-surface2)',
        }}>
          <span style={{ fontSize: '1.25rem' }}>💵</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
            كاش عند الاستلام
          </span>
        </div>
      </div>

      {/* بنك أو صراف */}
      {banks.length > 0 && (
        <div
          onClick={() => selectType('bank')}
          style={{
            border: `2px solid ${selectedType === 'bank' ? 'var(--blue-primary)' : 'var(--border)'}`,
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: selectedType === 'bank' ? 'rgba(21,118,212,0.06)' : 'var(--bg-surface2)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🏦</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
              بنك أو صراف
            </span>
          </div>
          <SubList type="bank" items={banks} />
        </div>
      )}

      {/* محفظة إلكترونية */}
      {wallets.length > 0 && (
        <div
          onClick={() => selectType('wallet')}
          style={{
            border: `2px solid ${selectedType === 'wallet' ? 'var(--blue-primary)' : 'var(--border)'}`,
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: selectedType === 'wallet' ? 'rgba(21,118,212,0.06)' : 'var(--bg-surface2)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>📱</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
              محفظة إلكترونية
            </span>
          </div>
          <SubList type="wallet" items={wallets} />
        </div>
      )}
    </div>
  )
}
