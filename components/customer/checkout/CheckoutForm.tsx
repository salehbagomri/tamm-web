'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/store/cart-context'
import { createProductOrder, type CheckoutData } from '@/lib/actions/orders'
import Input from '@/components/ui/Input'

const TIME_SLOTS = [
  { key: '8AM-12PM', label: 'صباحاً (8 ص - 12 م)' },
  { key: '12PM-4PM', label: 'ظهراً (12 م - 4 م)' },
  { key: '4PM-8PM', label: 'مساءً (4 م - 8 م)' },
]

interface CheckoutFormProps {
  initialAddress?: string | null
  initialPhone?: string | null
}

export default function CheckoutForm({ initialAddress, initialPhone }: CheckoutFormProps) {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<CheckoutData>({
    address: initialAddress ?? '',
    phone: initialPhone ?? '',
    notes: '',
    preferredDate: '',
    preferredTimeSlot: '',
  })
  const [errors, setErrors] = useState<Partial<CheckoutData>>({})

  const today = new Date().toISOString().split('T')[0]

  function update(key: keyof CheckoutData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validateStep1(): boolean {
    const e: Partial<CheckoutData> = {}
    if (!formData.address.trim() || formData.address.trim().length < 10) e.address = 'يرجى إدخال عنوان تفصيلي (10 أحرف على الأقل)'
    if (!formData.phone.trim()) e.phone = 'يرجى إدخال رقم الجوال'
    else if (!/^05\d{8}$/.test(formData.phone.trim())) e.phone = 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(): boolean {
    const e: Partial<CheckoutData> = {}
    if (!formData.preferredDate) e.preferredDate = 'يرجى اختيار التاريخ'
    if (!formData.preferredTimeSlot) e.preferredTimeSlot = 'يرجى اختيار وقت التسليم'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const result = await createProductOrder(items, formData)
    if ('error' in result) {
      setError(result.error)
      setLoading(false)
    } else {
      clearCart()
      router.push(`/order-success?order=${result.orderNumber}`)
    }
  }

  // مؤشر الخطوات
  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '2.5rem' }}>
      {[1, 2, 3].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s',
              backgroundColor: step > s ? 'var(--success)' : step === s ? 'var(--blue-primary)' : 'var(--bg-surface2)',
              color: step >= s ? '#fff' : 'var(--text-faint)',
              border: `2px solid ${step > s ? 'var(--success)' : step === s ? 'var(--blue-primary)' : 'var(--border)'}`,
            }}>
              {step > s ? '✓' : s}
            </div>
            <span style={{ fontSize: '0.75rem', color: step === s ? 'var(--text-primary)' : 'var(--text-faint)', whiteSpace: 'nowrap' }}>
              {['بيانات التوصيل', 'الموعد', 'التأكيد'][i]}
            </span>
          </div>
          {i < 2 && (
            <div style={{
              width: '80px', height: '2px', margin: '-12px 0 0',
              backgroundColor: step > s ? 'var(--success)' : 'var(--border)',
              transition: 'background-color 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        إتمام الطلب
      </h1>
      <p style={{ color: 'var(--text-second)', marginBottom: '2rem' }}>
        خطوة {step} من 3
      </p>

      <StepIndicator />

      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem',
      }}>
        {/* ── الخطوة 1: بيانات التوصيل ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              بيانات التوصيل
            </h2>

            <Input label="العنوان الكامل" id="checkout-address" type="text" dir="rtl"
              placeholder="المنطقة، الحي، الشارع، رقم المبنى..."
              value={formData.address} onChange={(e) => update('address', e.target.value)}
              error={errors.address} />

            <Input label="رقم الجوال" id="checkout-phone" type="tel" dir="ltr"
              placeholder="05xxxxxxxx" value={formData.phone}
              onChange={(e) => update('phone', e.target.value)}
              error={errors.phone} style={{ textAlign: 'right' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                placeholder="أي تعليمات أو ملاحظات للفني..."
                value={formData.notes}
                onChange={(e) => update('notes', e.target.value)}
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

            <button onClick={() => validateStep1() && setStep(2)}
              style={{
                padding: '0.875rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
              التالي: اختيار الموعد →
            </button>
          </div>
        )}

        {/* ── الخطوة 2: الموعد ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              الموعد المفضل
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
                التاريخ المفضل
              </label>
              <input
                type="date" min={today} value={formData.preferredDate}
                onChange={(e) => update('preferredDate', e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface2)',
                  border: `1px solid ${errors.preferredDate ? 'var(--error)' : 'var(--border)'}`,
                  borderRadius: '10px', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: '0.9375rem', outline: 'none',
                  direction: 'ltr',
                }}
              />
              {errors.preferredDate && (
                <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: 0 }}>{errors.preferredDate}</p>
              )}
            </div>

            <div>
              <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                وقت التسليم المفضل
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {TIME_SLOTS.map((slot) => (
                  <label key={slot.key}
                    style={{
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
              {errors.preferredTimeSlot && (
                <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: '0.5rem 0 0' }}>{errors.preferredTimeSlot}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(1)}
                style={{
                  flex: '0 0 auto', padding: '0.875rem 1.5rem', borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
                  color: 'var(--text-second)', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                ← السابق
              </button>
              <button onClick={() => validateStep2() && setStep(3)}
                style={{
                  flex: 1, padding: '0.875rem', borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                  color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                التالي: مراجعة الطلب →
              </button>
            </div>
          </div>
        )}

        {/* ── الخطوة 3: مراجعة وتأكيد ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              مراجعة الطلب
            </h2>

            {/* ملخص المنتجات */}
            <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '12px', padding: '1rem' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>المنتجات ({items.length})</p>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.quantity}x {item.name}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {item.isPriceOnRequest ? 'عند الطلب' : `${((item.price ?? 0) * item.quantity).toLocaleString('ar-SA')} ر.س`}
                    </span>
                  </div>
                  {item.includeInstallation && item.installationPrice > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', paddingRight: '1.25rem' }}>
                      <span style={{ color: 'var(--blue-light)' }}>🛠 خدمة التركيب</span>
                      <span style={{ color: 'var(--text-second)' }}>+ {(item.installationPrice * item.quantity).toLocaleString('ar-SA')} ر.س</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* بيانات التوصيل */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'العنوان', value: formData.address },
                { label: 'الجوال', value: formData.phone },
                { label: 'التاريخ', value: formData.preferredDate },
                { label: 'الوقت', value: TIME_SLOTS.find(s => s.key === formData.preferredTimeSlot)?.label ?? '' },
              ].map((row) => (
                <div key={row.label} style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0 0 0.25rem' }}>{row.label}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>{row.value || '—'}</p>
                </div>
              ))}
            </div>

            {/* الإجمالي */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(21,118,212,0.08)', borderRadius: '12px', border: '1px solid rgba(21,118,212,0.2)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>الإجمالي</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--blue-light)' }}>{totalAmount.toLocaleString('ar-SA')} ر.س</span>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: '10px', color: 'var(--error)', textAlign: 'center', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(2)}
                style={{
                  flex: '0 0 auto', padding: '0.875rem 1.5rem', borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
                  color: 'var(--text-second)', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                ← السابق
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{
                  flex: 1, padding: '0.875rem', borderRadius: '12px',
                  background: loading ? 'var(--bg-surface2)' : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                  color: loading ? 'var(--text-faint)' : '#fff',
                  fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontSize: '1rem',
                }}>
                {loading ? 'جاري التأكيد...' : 'تأكيد الطلب ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
