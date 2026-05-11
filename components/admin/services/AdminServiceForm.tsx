'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ServiceType, ServiceCategory } from '@/lib/types/service'
import { createService, updateService } from '@/lib/actions/admin/services'

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'ac_install',      label: 'تركيب تكييف' },
  { value: 'ac_repair',       label: 'إصلاح تكييف' },
  { value: 'ac_wash',         label: 'غسيل تكييف' },
  { value: 'ac_maintenance',  label: 'صيانة تكييف' },
  { value: 'solar_install',   label: 'تركيب طاقة شمسية' },
  { value: 'solar_maintenance','label': 'صيانة طاقة شمسية' },
  { value: 'consultation',    label: 'استشارة' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface2)',
  border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)',
  fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { fontSize: '0.8125rem', color: 'var(--text-second)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }
const card: React.CSSProperties = { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }
const checkboxRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer' }

export default function AdminServiceForm({ service }: { service?: ServiceType }) {
  const router = useRouter()
  const isEdit = !!service

  const [name, setName]                 = useState(service?.name ?? '')
  const [category, setCategory]         = useState<ServiceCategory>(service?.category ?? 'ac_install')
  const [description, setDescription]   = useState(service?.description ?? '')
  const [basePrice, setBasePrice]       = useState(service?.basePrice?.toString() ?? '')
  const [isQuoteBased, setIsQuoteBased] = useState(service?.isQuoteBased ?? false)
  const [duration, setDuration]         = useState(service?.estimatedDuration ?? '')
  const [includes, setIncludes]         = useState<string[]>(service?.includes ?? [])
  const [newInclude, setNewInclude]     = useState('')
  const [isActive, setIsActive]         = useState(service?.isActive ?? true)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('اسم الخدمة مطلوب'); return }
    setLoading(true); setError(''); setSuccess('')

    const data = {
      name, category, description: description || null,
      basePrice: isQuoteBased ? 0 : (parseFloat(basePrice) || 0),
      isQuoteBased, estimatedDuration: duration || null,
      includes, isActive,
    }

    if (isEdit) {
      const res = await updateService(service!.id, data)
      setLoading(false)
      if (res.error) setError(res.error)
      else { setSuccess('تم تحديث الخدمة بنجاح ✓'); setTimeout(() => router.push('/admin/services'), 1500) }
    } else {
      const res = await createService(data)
      setLoading(false)
      if (res.error) setError(res.error)
      else { setSuccess('تم إنشاء الخدمة بنجاح ✓'); setTimeout(() => router.push('/admin/services'), 1500) }
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {success && <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: 'rgba(34,201,138,0.1)', border: '1px solid rgba(34,201,138,0.3)', color: 'var(--success)', fontSize: '0.875rem' }}>{success}</div>}
      {error  && <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)', fontSize: '0.875rem' }}>{error}</div>}

      <div style={card}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>📋 معلومات الخدمة</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>اسم الخدمة *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} placeholder="مثال: تركيب مكيف سبليت" />
          </div>
          <div>
            <label style={labelStyle}>الفئة *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory)} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>المدة التقديرية</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} placeholder="مثال: 2-3 ساعات" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>وصف الخدمة</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="وصف تفصيلي للخدمة..." />
          </div>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>💰 التسعير</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={checkboxRow}>
            <input type="checkbox" checked={isQuoteBased} onChange={(e) => setIsQuoteBased(e.target.checked)} style={{ accentColor: 'var(--warning)', width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>💬 يحتاج عرض سعر</span>
          </label>
          {!isQuoteBased && (
            <div>
              <label style={labelStyle}>السعر الأساسي (ر.س)</label>
              <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} style={inputStyle} placeholder="0" min="0" step="0.01" />
            </div>
          )}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>✅ يشمل الخدمة</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input value={newInclude} onChange={(e) => setNewInclude(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newInclude.trim()) { setIncludes([...includes, newInclude.trim()]); setNewInclude('') } } }}
            placeholder="أضف عنصراً ثم اضغط Enter..." style={{ ...inputStyle, flex: 1 }} />
          <button type="button"
            onClick={() => { if (newInclude.trim()) { setIncludes([...includes, newInclude.trim()]); setNewInclude('') } }}
            style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(21,118,212,0.1)', border: '1px solid rgba(21,118,212,0.25)', color: 'var(--blue-light)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, whiteSpace: 'nowrap' }}>
            + إضافة
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {includes.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '8px', padding: '0.5rem 0.875rem' }}>
              <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>✓ {item}</span>
              <button type="button" onClick={() => setIncludes(includes.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1rem', padding: '0' }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <label style={checkboxRow}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ accentColor: 'var(--success)', width: '18px', height: '18px' }} />
          <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>الخدمة نشطة ومتاحة للعملاء</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '0.875rem' }}>
        <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.9375rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'جاري الحفظ...' : isEdit ? '💾 حفظ التعديلات' : '✓ إنشاء الخدمة'}
        </button>
        <button type="button" onClick={() => router.push('/admin/services')} style={{ padding: '0.9375rem 1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)', color: 'var(--text-second)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          إلغاء
        </button>
      </div>
    </form>
  )
}
