import type { Order } from '@/lib/types/order'
import type { PaymentMethod } from '@/lib/types/payment'
import { ORDER_TYPE_LABELS, ORDER_TYPE_ICONS } from './OrderCard'
import ReceiptUpload from './ReceiptUpload'

export default function OrderDetailCard({ order, paymentMethod }: { order: Order; paymentMethod?: PaymentMethod | null }) {
  const date = new Date(order.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  
  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            الطلب {order.orderNumber}
          </h2>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            {ORDER_TYPE_ICONS[order.orderType]}
            <span>{ORDER_TYPE_LABELS[order.orderType] ?? order.orderType} • {date}</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* العنوان */}
        {order.address && (
          <div style={{ backgroundColor: 'var(--bg-surface2)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0 0 0.25rem' }}>عنوان التوصيل / الخدمة</p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>{order.address}</p>
          </div>
        )}

        {/* الموعد המفضل */}
        {(order.preferredDate || order.preferredTimeSlot) && (
          <div style={{ backgroundColor: 'var(--bg-surface2)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0 0 0.25rem' }}>الموعد المفضل</p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
              {order.preferredDate} {order.preferredTimeSlot ? `(${order.preferredTimeSlot})` : ''}
            </p>
          </div>
        )}
      </div>

      {/* طريقة الدفع */}
      <div style={{ backgroundColor: 'var(--bg-surface2)', padding: '1rem', borderRadius: '12px' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0 0 0.25rem' }}>طريقة الدفع</p>
        {order.paymentType === 'cash' && (
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>
            كاش عند الاستلام
          </p>
        )}
        {order.paymentType === 'bank' && (
          <div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
              {paymentMethod?.name ?? 'بنك أو صراف'}
            </p>
            {paymentMethod?.accountNumber && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0.25rem 0 0' }}>
                رقم الحساب: {paymentMethod.accountNumber}
              </p>
            )}
          </div>
        )}
        {order.paymentType === 'wallet' && (
          <div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              {paymentMethod?.name ?? 'محفظة إلكترونية'}
            </p>
            {paymentMethod?.accountNumber && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0.25rem 0 0' }}>
                رقم الحساب: {paymentMethod.accountNumber}
              </p>
            )}
          </div>
        )}
      </div>

      {/* إرفاق سند التحويل */}
      {(order.paymentType === 'bank' || order.paymentType === 'wallet') && (
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0 0 0.625rem' }}>سند التحويل</p>
          <ReceiptUpload
            orderId={order.id}
            currentReceiptUrl={order.receiptUrl}
            paymentType={order.paymentType}
          />
        </div>
      )}

      {/* الملاحظات */}
      {order.notes && (
        <div style={{ backgroundColor: 'rgba(21,118,212,0.05)', border: '1px solid rgba(21,118,212,0.1)', padding: '1rem', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--blue-light)', margin: '0 0 0.25rem', fontWeight: 600 }}>ملاحظاتك</p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>{order.notes}</p>
        </div>
      )}
    </div>
  )
}
