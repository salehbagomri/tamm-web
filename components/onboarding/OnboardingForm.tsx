'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeProfile } from '@/lib/actions/profile'

import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { UserRole } from '@/lib/types/user'

export default function OnboardingForm({ role }: { role: UserRole }) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: typeof errors = {}
    if (!fullName.trim()) newErrors.fullName = 'يرجى إدخال الاسم الكامل'
    else if (fullName.trim().length < 2) newErrors.fullName = 'الاسم يجب أن يكون حرفين على الأقل'
    if (!phone.trim()) newErrors.phone = 'يرجى إدخال رقم الهاتف'
    else if (!/^\d{7,15}$/.test(phone.trim())) newErrors.phone = 'يرجى إدخال رقم هاتف صحيح'

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    setErrors({})

    const result = await completeProfile({ fullName: fullName.trim(), phone: phone.trim() })

    if (result.error) {
      setErrors({ general: result.error })
      setLoading(false)
      return
    }

    router.refresh()
    if (role === 'manager') router.push('/admin/dashboard')
    else if (role === 'technician') router.push('/access-denied')
    else router.push('/home')
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {errors.general && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(224,82,82,0.1)',
          border: '1px solid rgba(224,82,82,0.3)',
          borderRadius: '10px',
          color: 'var(--error)',
          fontSize: '0.875rem',
          textAlign: 'center',
        }}>
          {errors.general}
        </div>
      )}

      <Input
        label="الاسم الكامل"
        id="onboarding-name"
        type="text"
        placeholder="مثال: صالح عمر"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        autoComplete="name"
      />

      <Input
        label="رقم الهاتف"
        id="onboarding-phone"
        type="tel"
        dir="ltr"
        placeholder="مثال: 777123456"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        autoComplete="tel"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {loading ? 'جاري الحفظ...' : 'إكمال الحساب'}
      </Button>
    </form>
  )
}
