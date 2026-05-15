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
  const [showList, setShowList] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const banks = paymentMethods.filter((m) => m.type === 'bank')
  const wallets = paymentMethods.filter((m) => m.type === 'wallet')
  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId) ?? null

  function selectType(type: 'cash' | 'bank' | 'wallet') {
    if (type === 'cash') {
      setSelectedType('cash')
      setSelectedMethodId(null)
      setShowList(false)
      onChange('cash', null)
    } else if (selectedType !== type) {
      setSelectedType(type)
      setSelectedMethodId(null)
      setShowList(true)
    }
  }

  function selectMethod(type: 'bank' | 'wallet', id: string) {
    setSelectedMethodId(id)
    setShowList(false)
    onChange(type, id)
  }

  async function copyAccountNumber(accountNumber: string, methodId: string) {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopiedId(methodId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // clipboard unavailable — fail silently
    }
  }

  function renderSubList(type: 'bank' | 'wallet', items: PaymentMethod[]) {
    const isOpen = selectedType === type && showList
    return (
      <div style={{
        maxHeight: isOpen ? `${items.length * 76}px` : '0',
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
  }

  function renderTypeCard(type: 'bank' | 'wallet', items: PaymentMethod[]) {
    if (items.length === 0) return null
    const isSelected = selectedType === type
    const hasMethodSelected = isSelected && selectedMethodId !== null
    const icon = type === 'bank' ? '🏦' : '📱'
    const label = type === 'bank' ? 'بنك أو صراف' : 'محفظة إلكترونية'

    return (
      <div
        key={type}
        onClick={() => selectType(type)}
        style={{
          border: `2px solid ${isSelected ? 'var(--blue-primary)' : 'var(--border)'}`,
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
          backgroundColor: isSelected ? 'rgba(21,118,212,0.08)' : 'var(--bg-surface2)',
          transition: 'background-color 0.2s',
        }}>
          {hasMethodSelected && selectedMethod ? (
            <div style={{ flex: 1 }}>
              {/* الصف العلوي: الاسم + زر تغيير */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
                  {icon} {selectedMethod.name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowList(true) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600,
                    padding: 0, fontFamily: 'inherit',
                  }}
                >
                  تغيير
                </button>
              </div>
              {/* الصف السفلي: رقم الحساب + نسخ */}
              {selectedMethod.accountNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-second)' }}>
                    رقم الحساب: {selectedMethod.accountNumber}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyAccountNumber(selectedMethod.accountNumber!, selectedMethod.id)
                    }}
                    title="نسخ رقم الحساب"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '14px', lineHeight: 1, padding: '0 0.25rem',
                      color: copiedId === selectedMethod.id ? 'var(--success)' : 'var(--text-faint)',
                      transition: 'color 0.15s',
                      fontFamily: 'inherit',
                    }}
                  >
                    {copiedId === selectedMethod.id ? '✓' : '📋'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <span style={{ fontSize: '1.25rem' }}>{icon}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
                {label}
              </span>
            </>
          )}
        </div>
        {renderSubList(type, items)}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
        طريقة الدفع
      </p>

      {/* كاش عند الاستلام */}
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
          backgroundColor: selectedType === 'cash' ? 'rgba(21,118,212,0.08)' : 'var(--bg-surface2)',
          transition: 'background-color 0.2s',
        }}>
          <span style={{ fontSize: '1.25rem' }}>💵</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
            كاش عند الاستلام
          </span>
        </div>
      </div>

      {renderTypeCard('bank', banks)}
      {renderTypeCard('wallet', wallets)}
    </div>
  )
}
