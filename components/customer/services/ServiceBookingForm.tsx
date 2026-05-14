'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createServiceOrder, type BookingData } from '@/lib/actions/orders'
import type { ServiceType } from '@/lib/types/service'
import Input from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils/format'

const TIME_SLOTS = [
  { key: '8AM-12PM', label: 'صباحاً (8 ص - 12 م)' },
  { key: '12PM-4PM', label: 'ظهراً (12 م - 4 م)' },
  { key: '4PM-8PM', label: 'مساءً (4 م - 8 م)' },
]

interface ServiceBookingFormProps {
  service: ServiceType
  initialAddress?: string | null
  initialPhone?: string | null
}

export default function ServiceBookingForm({ service, initialAddress, initialPhone }: ServiceBookingFormProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState<BookingData>({
    address: initialAddress ?? '',
    phone: initialPhone ?? '',
    notes: '',
    preferredDate: '',
    preferredTimeSlot: '',
  })
  const [errors, setErrors] = useState<Partial<BookingData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(key: keyof BookingData, value: string) {
    setFormData((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<BookingData> = {}
    if (!formData.address.trim() || formData.address.trim().length < 10)
      e.address = 'يرجى إدخال عنوان تفصيلي (10 أحرف على الأقل)'
    if (!formData.phone.trim())
      e.phone = 'يرجى إدخال رقم الجوال'
    else if (!/^7[0-9]{8}$/.test(formData.phone.trim()))
      e.phone = 'أدخل رقم هاتف يمني صحيح (7XXXXXXXX)'
    if (!formData.preferredDate) e.preferredDate = 'يرجى اختيار التاريخ'
    if (!formData.preferredTimeSlot) e.preferredTimeSlot = 'يرجى اختيار وقت الزيارة'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    const result = await createServiceOrder(
      service.id, service.name, service.basePrice,
      service.isQuoteBased, formData
    )
    if ('error' in result) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/order-success?order=${result.orderNumber}`)
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* ملخص الخدمة */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1.25rem', marginBottom: '2rem',
        backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '14px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem',
        }}>🔧</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.2rem' }}>{service.name}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-second)', margin: 0 }}>
            {service.isQuoteBased ? 'سيتم تحديد السعر حسب الموقع' : formatPrice(service.basePrice)}
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem',
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.75rem' }}>
          {service.isQuoteBased ? 'طلب عرض سعر' : 'حجز الخدمة'}
        </h1>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input label="العنوان الكامل" id="book-address" type="text" dir="rtl"
            placeholder="المنطقة، الحي، الشارع، رقم المبنى..."
            value={formData.address} onChange={(e) => update('address', e.target.value)}
            error={errors.address} />

          <Input label="رقم الجوال" id="book-phone" type="tel" dir="ltr"
            placeholder="7XXXXXXXX" value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
            maxLength={9}
            error={errors.phone} style={{ textAlign: 'right' }} />

          {/* التاريخ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
              التاريخ المفضل
            </label>
            <input type="date" min={today} value={formData.preferredDate}
              onChange={(e) => update('preferredDate', e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', direction: 'ltr',
                backgroundColor: 'var(--bg-surface2)',
                border: `1px solid ${errors.preferredDate ? 'var(--error)' : 'var(--border)'}`,
                borderRadius: '10px', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontSize: '0.9375rem', outline: 'none',
              }} />
            {errors.preferredDate && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: 0 }}>{errors.preferredDate}</p>}
          </div>

          {/* وقت الزيارة */}
          <div>
            <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>
              وقت الزيارة المفضل
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {TIME_SLOTS.map((slot) => (
                <label key={slot.key} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer',
                  border: `1px solid ${formData.preferredTimeSlot === slot.key ? 'var(--blue-primary)' : 'var(--border)'}`,
                  backgroundColor: formData.preferredTimeSlot === slot.key ? 'rgba(21,118,212,0.1)' : 'var(--bg-surface2)',
                  transition: 'all 0.15s',
                }}>
                  <input type="radio" name="timeSlot" value={slot.key}
                    checked={formData.preferredTimeSlot === slot.key}
                    onChange={() => update('preferredTimeSlot', slot.key)}
                    style={{ accentColor: 'var(--blue-primary)' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{slot.label}</span>
                </label>
              ))}
            </div>
            {errors.preferredTimeSlot && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: '0.5rem 0 0' }}>{errors.preferredTimeSlot}</p>}
          </div>

          {/* ملاحظات */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
              ملاحظات إضافية (اختياري)
            </label>
            <textarea placeholder="أوصف المشكلة أو أي تفاصيل تساعد الفني..."
              value={formData.notes} onChange={(e) => update('notes', e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                color: 'var(--text-primary)', fontFamily: 'inherit',
                fontSize: '0.9375rem', outline: 'none', resize: 'vertical',
              }} />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '10px',
              backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
              color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center',
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '0.9375rem', borderRadius: '12px',
            background: loading ? 'var(--bg-surface2)' : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
            color: loading ? 'var(--text-faint)' : '#fff',
            fontWeight: 700, fontSize: '1rem', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 8px 24px rgba(21,118,212,0.3)',
          }}>
            {loading ? 'جاري الإرسال...' : service.isQuoteBased ? 'إرسال طلب السعر ✓' : 'تأكيد الحجز ✓'}
          </button>
        </form>
      </div>
    </div>
  )
}
