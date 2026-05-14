'use client'

import Image from 'next/image'
import { useCart, type CartItem } from '@/lib/store/cart-context'
import { formatPrice } from '@/lib/utils/format'

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart, toggleInstallation } = useCart()

  const unitPrice = (item.price ?? 0) + (item.includeInstallation ? item.installationPrice : 0)
  const totalPrice = unitPrice * item.quantity

  return (
    <div style={{
      display: 'flex', gap: '1rem', padding: '1.25rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)', borderRadius: '14px',
      alignItems: 'flex-start',
    }}>
      {/* صورة المنتج */}
      <div style={{
        width: '80px', height: '80px', flexShrink: 0,
        backgroundColor: 'var(--bg-surface2)', borderRadius: '10px',
        overflow: 'hidden', position: 'relative',
      }}>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: '#fff', background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
          }}>تمّ</div>
        )}
      </div>

      {/* التفاصيل */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </p>

        {item.isPriceOnRequest ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--blue-light)', margin: '0 0 0.75rem' }}>
            السعر عند الطلب
          </p>
        ) : (
          <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
            {formatPrice(totalPrice)}
          </p>
        )}

        {/* خيار التركيب */}
        {item.requiresInstallation && item.installationPrice > 0 && !item.isPriceOnRequest && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={item.includeInstallation}
              onChange={() => toggleInstallation(item.id)}
              style={{ accentColor: 'var(--blue-primary)', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-second)' }}>
              تضمين التركيب (+{formatPrice(item.installationPrice)})
            </span>
          </label>
        )}

        {/* عداد الكمية + زر الحذف */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface2)',
                color: 'var(--text-primary)', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: item.quantity <= 1 ? 0.4 : 1,
              }}>−</button>
            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.quantity}
            </span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface2)',
                color: 'var(--text-primary)', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
          </div>

          <button onClick={() => removeFromCart(item.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--error)', fontSize: '0.8125rem', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            حذف
          </button>
        </div>
      </div>
    </div>
  )
}
