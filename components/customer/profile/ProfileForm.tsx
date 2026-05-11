'use client'

import { useState } from 'react'
import type { UserProfile } from '@/lib/types/user'
import { updateProfile } from '@/lib/actions/profile'
import Input from '@/components/ui/Input'

export default function ProfileForm({ profile }: { profile: UserProfile }) {
  const [fullName, setFullName] = useState(profile.fullName ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [address, setAddress] = useState(profile.address ?? '')

  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const isDirty =
    fullName !== (profile.fullName ?? '') ||
    phone !== (profile.phone ?? '') ||
    address !== (profile.address ?? '')

  function validate(): boolean {
    const e: { fullName?: string; phone?: string } = {}
    if (!fullName.trim() || fullName.trim().length < 3)
      e.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل'
    if (!phone.trim())
      e.phone = 'رقم الجوال مطلوب'
    else if (!/^7[0-9]{8}$/.test(phone.trim()))
      e.phone = 'أدخل رقم هاتف يمني صحيح (7XXXXXXXX)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isDirty) return
    if (!validate()) return

    setLoading(true)
    setSuccess(false)
    setError('')

    const result = await updateProfile({ fullName: fullName.trim(), phone: phone.trim(), address: address.trim() })

    if ('error' in result) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    }
    setLoading(false)
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '1.75rem',
    }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.5rem' }}>
        تعديل البيانات الشخصية
      </h2>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="الاسم الكامل"
          id="profile-name"
          type="text"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })) }}
          error={errors.fullName}
          placeholder="أدخل اسمك الكامل"
        />

        <Input
          label="رقم الجوال"
          id="profile-phone"
          type="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })) }}
          error={errors.phone}
          placeholder="7XXXXXXXX"
          maxLength={9}
          style={{ textAlign: 'right' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}>
            العنوان (اختياري)
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="المنطقة، الحي، الشارع..."
            rows={2}
            style={{
              width: '100%', padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-surface2)',
              border: '1px solid var(--border)', borderRadius: '10px',
              color: 'var(--text-primary)', fontFamily: 'inherit',
              fontSize: '0.9375rem', outline: 'none', resize: 'vertical',
            }}
          />
        </div>

        {/* رسائل الحالة */}
        {success && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '10px',
            backgroundColor: 'rgba(34,201,138,0.1)', border: '1px solid rgba(34,201,138,0.3)',
            color: 'var(--success)', fontSize: '0.875rem', textAlign: 'center',
          }}>
            ✓ تم حفظ التغييرات بنجاح
          </div>
        )}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '10px',
            backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
            color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isDirty}
          style={{
            padding: '0.875rem', borderRadius: '12px',
            background: loading || !isDirty
              ? 'var(--bg-surface2)'
              : 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
            color: loading || !isDirty ? 'var(--text-faint)' : '#fff',
            fontWeight: 700, fontSize: '1rem', border: 'none',
            cursor: loading || !isDirty ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: !loading && isDirty ? '0 8px 24px rgba(21,118,212,0.25)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  )
}
