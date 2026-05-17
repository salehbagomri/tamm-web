'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/store/cart-context'
import { createProductOrder, type CheckoutData } from '@/lib/actions/orders'
import Input from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils/format'
import PaymentMethodSelector from './PaymentMethodSelector'
import TammDatePicker from './TammDatePicker'
import OrderSuccessModal from './OrderSuccessModal'
import type { PaymentMethod } from '@/lib/types/payment'

const TIME_SLOTS = [
  { key: '8AM-12PM', label: 'صباحاً (8 ص - 12 م)' },
  { key: '12PM-4PM', label: 'ظهراً (12 م - 4 م)' },
  { key: '4PM-8PM', label: 'مساءً (4 م - 8 م)' },
]

const CITIES = [{ key: 'المكلا', label: 'المكلا' }]

const STEP_LABELS = ['الموقع والعنوان', 'موعد التسليم', 'طريقة الدفع', 'التأكيد']

const ICON_CASH = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
    <path d="M6 12h.01M18 12h.01"/>
  </svg>
)
const ICON_BANK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/>
  </svg>
)
const ICON_WALLET = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)
const ICON_WRENCH = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)

interface CheckoutFormProps {
  initialAddress?: string | null
  initialPhone?: string | null
  paymentMethods: PaymentMethod[]
}

type FormErrors = Partial<Record<keyof CheckoutData | 'city', string>>

// Convert a Date to YYYY-MM-DD string for DB storage
function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Convert YYYY-MM-DD back to a Date for the picker initial value
function fromDateString(s: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function CheckoutForm({ initialAddress, initialPhone, paymentMethods }: CheckoutFormProps) {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // city, latitude, longitude now live inside formData so they're automatically
  // passed to createProductOrder and saved to the orders table
  const [formData, setFormData] = useState<CheckoutData>({
    address: initialAddress ?? '',
    phone: initialPhone ?? '',
    notes: '',
    preferredDate: '',
    preferredTimeSlot: '',
    city: 'المكلا',
    latitude: null,
    longitude: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const [selectedPaymentType, setSelectedPaymentType] = useState<'cash' | 'bank' | 'wallet'>('cash')
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState('')

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState('')
  const [successOrderNumber, setSuccessOrderNumber] = useState('')
  const [successPaymentType, setSuccessPaymentType] = useState<'cash' | 'bank' | 'wallet'>('cash')

  function updateStr(key: keyof CheckoutData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handlePaymentChange(type: 'cash' | 'bank' | 'wallet', methodId: string | null) {
    setSelectedPaymentType(type)
    setSelectedPaymentMethodId(methodId)
    setPaymentError('')
  }

  function handleDateChange(date: Date) {
    setFormData((prev) => ({ ...prev, preferredDate: toDateString(date) }))
    setErrors((prev) => ({ ...prev, preferredDate: undefined }))
  }

  function requestGps() {
    if (!navigator.geolocation) { setGpsStatus('error'); return }
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }))
        setGpsStatus('success')
      },
      () => setGpsStatus('error'),
    )
  }

  function validateStep1(): boolean {
    const e: FormErrors = {}
    if (!formData.city) e.city = 'يرجى اختيار المدينة'
    if (!formData.address.trim() || formData.address.trim().length < 10)
      e.address = 'يرجى إدخال عنوان تفصيلي (10 أحرف على الأقل)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(): boolean {
    const e: FormErrors = {}
    if (!formData.phone.trim()) e.phone = 'يرجى إدخال رقم الجوال'
    else if (!/^7[0-9]{8}$/.test(formData.phone.trim())) e.phone = 'أدخل رقم هاتف يمني صحيح (7XXXXXXXX)'
    if (!formData.preferredDate) e.preferredDate = 'يرجى اختيار التاريخ'
    if (!formData.preferredTimeSlot) e.preferredTimeSlot = 'يرجى اختيار وقت التسليم'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validatePayment(): boolean {
    if (selectedPaymentType === 'bank' && !selectedPaymentMethodId) {
      setPaymentError('يرجى اختيار البنك أو الصراف')
      return false
    }
    if (selectedPaymentType === 'wallet' && !selectedPaymentMethodId) {
      setPaymentError('يرجى اختيار المحفظة')
      return false
    }
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const result = await createProductOrder(items, formData, selectedPaymentType, selectedPaymentMethodId)
    if ('error' in result) {
      setError(result.error)
      setLoading(false)
    } else {
      clearCart()
      setSuccessOrderNumber(result.orderNumber)
      setSuccessOrderId(result.orderId ?? '')
      setSuccessPaymentType(selectedPaymentType)
      setShowSuccessModal(true)
      setLoading(false)
    }
  }

  const selectedPaymentMethod = paymentMethods.find((m) => m.id === selectedPaymentMethodId) ?? null
  const PMICONS: Record<string, React.ReactNode> = { cash: ICON_CASH, bank: ICON_BANK, wallet: ICON_WALLET }
  const paymentText =
    selectedPaymentType === 'cash'
      ? 'كاش عند الاستلام'
      : selectedPaymentType === 'bank'
      ? (selectedPaymentMethod?.name ?? 'بنك أو صراف')
      : (selectedPaymentMethod?.name ?? 'محفظة إلكترونية')

  // ── shared button styles ──
  const btnPrimary: React.CSSProperties = {
    flex: 1, padding: '0.875rem', borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
    color: '#fff', fontWeight: 700, fontSize: '1rem',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  }
  const btnSecondary: React.CSSProperties = {
    flex: '0 0 auto', padding: '0.875rem 1.5rem', borderRadius: '12px',
    backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
    color: 'var(--text-second)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9375rem',
  }
  const navRow: React.CSSProperties = { display: 'flex', gap: '0.75rem' }

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '2.5rem' }}>
      {[1, 2, 3, 4].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.3s',
              backgroundColor: step > s ? 'var(--success)' : step === s ? 'var(--blue-primary)' : 'var(--bg-surface2)',
              color: step >= s ? '#fff' : 'var(--text-faint)',
              border: `2px solid ${step > s ? 'var(--success)' : step === s ? 'var(--blue-primary)' : 'var(--border)'}`,
            }}>
              {step > s ? '✓' : s}
            </div>
            <span style={{ fontSize: '0.68rem', color: step === s ? 'var(--text-primary)' : 'var(--text-faint)', whiteSpace: 'nowrap' }}>
              {STEP_LABELS[i]}
            </span>
          </div>
          {i < 3 && (
            <div style={{
              width: '48px', height: '2px', margin: '-12px 0 0',
              backgroundColor: step > s ? 'var(--success)' : 'var(--border)',
              transition: 'background-color 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <>
    {showSuccessModal && (
      <OrderSuccessModal
        orderId={successOrderId}
        orderNumber={successOrderNumber}
        paymentType={successPaymentType}
        onContinueShopping={() => router.push('/store')}
        onViewOrder={() => router.push(`/orders/${successOrderId}`)}
      />
    )}
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        إتمام الطلب
      </h1>
      <p style={{ color: 'var(--text-second)', marginBottom: '2rem' }}>خطوة {step} من 4</p>

      <StepIndicator />

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>

        {/* ── الخطوة 1: الموقع والعنوان ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>الموقع والعنوان</h2>

            {/* اختيار المدينة */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>المدينة</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {CITIES.map((city) => (
                  <label key={city.key} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer',
                    border: `1px solid ${formData.city === city.key ? 'var(--blue-primary)' : 'var(--border)'}`,
                    backgroundColor: formData.city === city.key ? 'rgba(21,118,212,0.08)' : 'var(--bg-surface2)',
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name="city" value={city.key}
                      checked={formData.city === city.key}
                      onChange={() => {
                        setFormData((prev) => ({ ...prev, city: city.key }))
                        setErrors((prev) => ({ ...prev, city: undefined }))
                      }}
                      style={{ accentColor: 'var(--blue-primary)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{city.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 500, marginRight: 'auto' }}>
                      متاح للتوصيل
                    </span>
                  </label>
                ))}
              </div>
              {errors.city && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: 0 }}>{errors.city}</p>}
            </div>

            {/* تفاصيل العنوان */}
            <Input label="تفاصيل العنوان" id="checkout-address" type="text" dir="rtl"
              placeholder="الحي، الشارع، رقم المبنى..."
              value={formData.address} onChange={(e) => updateStr('address', e.target.value)}
              error={errors.address} />

            {/* الموقع الجغرافي */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
                الموقع الجغرافي <span style={{ fontWeight: 400, color: 'var(--text-faint)' }}>(اختياري)</span>
              </label>
              <button onClick={requestGps} type="button" disabled={gpsStatus === 'loading'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.75rem 1rem', borderRadius: '10px',
                  border: `1px solid ${gpsStatus === 'success' ? 'var(--success)' : gpsStatus === 'error' ? 'var(--error)' : 'var(--border)'}`,
                  backgroundColor: gpsStatus === 'success' ? 'rgba(34,197,94,0.08)' : 'var(--bg-surface2)',
                  color: gpsStatus === 'success' ? 'var(--success)' : gpsStatus === 'error' ? 'var(--error)' : 'var(--text-second)',
                  cursor: gpsStatus === 'loading' ? 'wait' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.9375rem', fontWeight: 500,
                  transition: 'all 0.2s', width: '100%', textAlign: 'right',
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {gpsStatus === 'idle' && 'تحديد موقعي الحالي'}
                {gpsStatus === 'loading' && 'جاري التحديد...'}
                {gpsStatus === 'success' && 'تم تحديد الموقع بنجاح'}
                {gpsStatus === 'error' && 'تعذّر الوصول للموقع — حاول مرة أخرى'}
              </button>
              {gpsStatus === 'success' && formData.latitude !== null && formData.longitude !== null && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0 }}>
                  {formData.latitude.toFixed(6)} ، {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <button onClick={() => validateStep1() && setStep(2)} style={btnPrimary}>
              التالي: موعد التسليم →
            </button>
          </div>
        )}

        {/* ── الخطوة 2: موعد التسليم ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>موعد التسليم</h2>

            <Input label="رقم الجوال" id="checkout-phone" type="tel" dir="ltr"
              placeholder="7XXXXXXXX" value={formData.phone}
              onChange={(e) => updateStr('phone', e.target.value)}
              maxLength={9} error={errors.phone} style={{ textAlign: 'right' }} />

            {/* التقويم المخصص */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>التاريخ المفضل</label>
              <TammDatePicker
                value={fromDateString(formData.preferredDate)}
                onChange={handleDateChange}
              />
              {errors.preferredDate && (
                <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: 0 }}>{errors.preferredDate}</p>
              )}
            </div>

            {/* الفترة الزمنية */}
            <div>
              <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                وقت التسليم المفضل
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
                      onChange={() => updateStr('preferredTimeSlot', slot.key)}
                      style={{ accentColor: 'var(--blue-primary)' }} />
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{slot.label}</span>
                  </label>
                ))}
              </div>
              {errors.preferredTimeSlot && (
                <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: '0.5rem 0 0' }}>{errors.preferredTimeSlot}</p>
              )}
            </div>

            <div style={navRow}>
              <button onClick={() => setStep(1)} style={btnSecondary}>← السابق</button>
              <button onClick={() => validateStep2() && setStep(3)} style={btnPrimary}>
                التالي: طريقة الدفع →
              </button>
            </div>
          </div>
        )}

        {/* ── الخطوة 3: طريقة الدفع ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>طريقة الدفع</h2>

            <PaymentMethodSelector paymentMethods={paymentMethods} onChange={handlePaymentChange} />

            {paymentError && (
              <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: 0 }}>{paymentError}</p>
            )}

            <div style={navRow}>
              <button onClick={() => setStep(2)} style={btnSecondary}>← السابق</button>
              <button onClick={() => validatePayment() && setStep(4)} style={btnPrimary}>
                التالي: مراجعة الطلب →
              </button>
            </div>
          </div>
        )}

        {/* ── الخطوة 4: مراجعة وتأكيد ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>مراجعة وتأكيد الطلب</h2>

            {/* ملاحظات */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
                ملاحظات إضافية <span style={{ fontWeight: 400, color: 'var(--text-faint)' }}>(اختياري)</span>
              </label>
              <textarea
                placeholder="أي تعليمات أو ملاحظات للفني..."
                value={formData.notes}
                onChange={(e) => updateStr('notes', e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface2)',
                  border: '1px solid var(--border)', borderRadius: '10px',
                  color: 'var(--text-primary)', fontFamily: 'inherit',
                  fontSize: '0.9375rem', outline: 'none', resize: 'vertical',
                }}
              />
            </div>

            {/* ملخص المنتجات */}
            <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', padding: '1rem' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
                المنتجات ({items.length})
              </p>
              {items.map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex', flexDirection: 'column', gap: '0.25rem',
                  ...(idx < items.length - 1 ? { marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' } : {}),
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.quantity}× {item.name}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {item.isPriceOnRequest ? 'عند الطلب' : formatPrice((item.price ?? 0) * item.quantity)}
                    </span>
                  </div>
                  {item.includeInstallation && item.installationPrice > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', paddingRight: '1.25rem' }}>
                      <span style={{ color: 'var(--blue-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {ICON_WRENCH} خدمة التركيب
                      </span>
                      <span style={{ color: 'var(--text-second)' }}>+ {formatPrice(item.installationPrice * item.quantity)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ملخص طريقة الدفع */}
            <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0 0 0.375rem' }}>طريقة الدفع</p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {PMICONS[selectedPaymentType]}
                {paymentText}
              </p>
              {selectedPaymentMethod?.accountNumber && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '0.25rem 0 0' }}>
                  رقم الحساب: {selectedPaymentMethod.accountNumber}
                </p>
              )}
            </div>

            {/* الإجمالي */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '1rem',
              backgroundColor: 'rgba(21,118,212,0.08)', borderRadius: '12px',
              border: '1px solid rgba(21,118,212,0.2)',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>الإجمالي</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--blue-light)' }}>{formatPrice(totalAmount)}</span>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
                borderRadius: '10px', color: 'var(--error)', textAlign: 'center', fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <div style={navRow}>
              <button onClick={() => setStep(3)} style={btnSecondary}>← السابق</button>
              <button onClick={handleSubmit} disabled={loading} style={{
                ...btnPrimary,
                background: loading ? 'var(--bg-surface2)' : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                color: loading ? 'var(--text-faint)' : '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'جاري التأكيد...' : 'تأكيد الطلب ←'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
