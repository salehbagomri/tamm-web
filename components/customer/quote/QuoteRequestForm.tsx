'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createQuoteRequest, type QuoteData } from '@/lib/actions/orders'
import Input from '@/components/ui/Input'

const SERVICE_CATEGORIES = [
  { key: 'ac_install', label: 'تركيب مكيف' },
  { key: 'ac_repair', label: 'إصلاح مكيف' },
  { key: 'ac_wash', label: 'غسيل مكيف' },
  { key: 'ac_maintenance', label: 'صيانة مكيف دورية' },
  { key: 'solar_install', label: 'تركيب ألواح شمسية' },
  { key: 'solar_maintenance', label: 'صيانة الطاقة الشمسية' },
  { key: 'consultation', label: 'استشارة فنية' },
  { key: 'other', label: 'أخرى' },
]

interface QuoteFormData {
  serviceCategory: string
  description: string
  address: string
  phone: string
  preferredDate: string
}

export default function QuoteRequestForm({ initialPhone }: { initialPhone?: string | null }) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState<QuoteFormData>({
    serviceCategory: '',
    description: '',
    address: '',
    phone: initialPhone ?? '',
    preferredDate: '',
  })
  const [errors, setErrors] = useState<Partial<QuoteFormData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(key: keyof QuoteFormData, value: string) {
    setFormData((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<QuoteFormData> = {}
    if (!formData.serviceCategory) e.serviceCategory = 'يرجى اختيار نوع الخدمة'
    if (!formData.description.trim() || formData.description.trim().length < 20)
      e.description = 'يرجى وصف المطلوب بتفصيل أكثر (20 حرف على الأقل)'
    if (!formData.address.trim() || formData.address.trim().length < 10)
      e.address = 'يرجى إدخال عنوان تفصيلي'
    if (!formData.phone.trim())
      e.phone = 'يرجى إدخال رقم الجوال'
    else if (!/^(?:\+967|00967)?7\d{8}$/.test(formData.phone.replace(/\s+/g, '')))
      e.phone = 'رقم الجوال يجب أن يكون بصيغة يمنية صحيحة (مثل 7xxxxxxxx أو +9677xxxxxxxx)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')

    const quoteData: QuoteData = {
      serviceCategory: formData.serviceCategory,
      description: formData.description,
      address: formData.address,
      phone: formData.phone,
      preferredDate: formData.preferredDate,
    }

    const result = await createQuoteRequest(quoteData)
    if ('error' in result) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/order-success?order=${result.orderNumber}`)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* رأس الصفحة */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 1rem', marginBottom: '1rem',
          backgroundColor: 'rgba(245,166,35,0.12)',
          border: '1px solid rgba(245,166,35,0.3)', borderRadius: '999px',
        }}>
          <span style={{ color: 'var(--warning)', fontSize: '0.875rem', fontWeight: 600 }}>
            💬 طلب عرض سعر مجاني
          </span>
        </div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          طلب عرض سعر
        </h1>
        <p style={{ color: 'var(--text-second)', margin: 0, lineHeight: 1.6 }}>
          أخبرنا بما تحتاجه وسنرسل لك عرض سعر مفصل خلال 24 ساعة
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem',
      }}>
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* نوع الخدمة */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
              نوع الخدمة المطلوبة
            </label>
            <select value={formData.serviceCategory}
              onChange={(e) => update('serviceCategory', e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface2)',
                border: `1px solid ${errors.serviceCategory ? 'var(--error)' : 'var(--border)'}`,
                borderRadius: '10px', color: formData.serviceCategory ? 'var(--text-primary)' : 'var(--text-faint)',
                fontFamily: 'inherit', fontSize: '0.9375rem', outline: 'none',
                cursor: 'pointer',
              }}>
              <option value="" disabled>اختر نوع الخدمة...</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key} style={{ backgroundColor: 'var(--bg-surface2)', color: 'var(--text-primary)' }}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.serviceCategory && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: 0 }}>{errors.serviceCategory}</p>}
          </div>

          {/* وصف المطلوب */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
              وصف المطلوب بالتفصيل
            </label>
            <textarea
              placeholder="مثال: لدي مكيف سبليت 2 طن في غرفة النوم، يعمل لكن لا يبرد بشكل كافٍ..."
              value={formData.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface2)',
                border: `1px solid ${errors.description ? 'var(--error)' : 'var(--border)'}`,
                borderRadius: '10px', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontSize: '0.9375rem', outline: 'none', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.description
                ? <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: 0 }}>{errors.description}</p>
                : <span />}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                {formData.description.length} حرف
              </span>
            </div>
          </div>

          <Input label="العنوان الكامل" id="quote-address" type="text" dir="rtl"
            placeholder="المنطقة، الحي، الشارع، رقم المبنى..."
            value={formData.address} onChange={(e) => update('address', e.target.value)}
            error={errors.address} />

          <Input label="رقم الجوال" id="quote-phone" type="tel" dir="ltr"
            placeholder="7xxxxxxxx" value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
            error={errors.phone} style={{ textAlign: 'right' }} />

          {/* التاريخ المفضل (اختياري) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
              التاريخ المفضل للزيارة (اختياري)
            </label>
            <input type="date" min={today} value={formData.preferredDate}
              onChange={(e) => update('preferredDate', e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', direction: 'ltr',
                backgroundColor: 'var(--bg-surface2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                color: 'var(--text-primary)', fontFamily: 'inherit',
                fontSize: '0.9375rem', outline: 'none',
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
            background: loading
              ? 'var(--bg-surface2)'
              : 'linear-gradient(135deg, var(--warning), rgba(245,166,35,0.7))',
            color: loading ? 'var(--text-faint)' : '#1a1a1a',
            fontWeight: 700, fontSize: '1rem', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}>
            {loading ? 'جاري الإرسال...' : '💬 إرسال طلب السعر'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-faint)', margin: 0 }}>
            سنتواصل معك خلال 24 ساعة بعرض سعر مفصل
          </p>
        </form>
      </div>
    </div>
  )
}
