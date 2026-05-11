'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, ProductCategory } from '@/lib/types/product'
import { createProduct, updateProduct, uploadProductImage } from '@/lib/actions/admin/products'

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'ac',            label: 'تكييف' },
  { value: 'solar_panel',   label: 'لوح شمسي' },
  { value: 'solar_battery', label: 'بطارية شمسية' },
  { value: 'solar_inverter',label: 'إنفيرتر شمسي' },
  { value: 'accessory',     label: 'إكسسوار' },
]

interface AdminProductFormProps { product?: Product }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface2)',
  border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)',
  fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: '0.8125rem', color: 'var(--text-second)', fontWeight: 500,
  marginBottom: '0.375rem', display: 'block',
}
const checkboxRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.625rem',
  padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface2)',
  border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer',
}

export default function AdminProductForm({ product }: AdminProductFormProps) {
  const router = useRouter()
  const isEdit = !!product
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName]                           = useState(product?.name ?? '')
  const [category, setCategory]                   = useState<ProductCategory>(product?.category ?? 'ac')
  const [brand, setBrand]                         = useState(product?.brand ?? '')
  const [description, setDescription]             = useState(product?.description ?? '')
  const [price, setPrice]                         = useState(product?.price?.toString() ?? '')
  const [oldPrice, setOldPrice]                   = useState(product?.oldPrice?.toString() ?? '')
  const [isPriceOnRequest, setIsPriceOnRequest]   = useState(product?.isPriceOnRequest ?? false)
  const [requiresInstallation, setRequiresInstallation] = useState(product?.requiresInstallation ?? false)
  const [installationPrice, setInstallationPrice] = useState(product?.installationPrice?.toString() ?? '')
  const [isAvailable, setIsAvailable]             = useState(product?.isAvailable ?? true)
  const [isFeatured, setIsFeatured]               = useState(product?.isFeatured ?? false)
  const [imageUrl, setImageUrl]                   = useState(product?.imageUrl ?? '')
  const [imagePreview, setImagePreview]           = useState(product?.imageUrl ?? '')
  const [specs, setSpecs]                         = useState<{ key: string; value: string }[]>(
    Object.entries(product?.specs ?? {}).map(([key, value]) => ({ key, value: String(value) }))
  )

  const [loading, setLoading]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await uploadProductImage(fd)
    setUploading(false)
    if (res.error) setError(res.error)
    else { setImageUrl(res.url ?? ''); setError('') }
  }

  function addSpec() { setSpecs([...specs, { key: '', value: '' }]) }
  function removeSpec(i: number) { setSpecs(specs.filter((_, idx) => idx !== i)) }
  function updateSpec(i: number, field: 'key' | 'value', val: string) {
    setSpecs(specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('اسم المنتج مطلوب'); return }
    if (!category) { setError('يرجى اختيار الفئة'); return }

    const specsObj = Object.fromEntries(specs.filter(s => s.key.trim()).map(s => [s.key.trim(), s.value.trim()]))

    setLoading(true); setError(''); setSuccess('')
    const data = {
      name, category, brand: brand || null, description: description || null,
      price: isPriceOnRequest ? null : (parseFloat(price) || null),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      isPriceOnRequest, requiresInstallation,
      installationPrice: requiresInstallation ? (parseFloat(installationPrice) || 0) : 0,
      isAvailable, isFeatured,
      imageUrl: imageUrl || null,
      specs: specsObj,
    }

    if (isEdit) {
      const res = await updateProduct(product!.id, data)
      setLoading(false)
      if (res.error) setError(res.error)
      else { setSuccess('تم تحديث المنتج بنجاح ✓'); setTimeout(() => router.push('/admin/products'), 1500) }
    } else {
      const res = await createProduct(data)
      setLoading(false)
      if (res.error) setError(res.error)
      else { setSuccess('تم إنشاء المنتج بنجاح ✓'); setTimeout(() => router.push('/admin/products'), 1500) }
    }
  }

  const card: React.CSSProperties = { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }
  const h3: React.CSSProperties = { margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {success && <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: 'rgba(34,201,138,0.1)', border: '1px solid rgba(34,201,138,0.3)', color: 'var(--success)', fontSize: '0.875rem' }}>{success}</div>}
      {error  && <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)', fontSize: '0.875rem' }}>{error}</div>}

      {/* ── المعلومات الأساسية ── */}
      <div style={card}>
        <h3 style={h3}>📝 المعلومات الأساسية</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>اسم المنتج *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} placeholder="مثال: مكيف سبليت 1.5 طن" />
          </div>
          <div>
            <label style={labelStyle}>الفئة *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>العلامة التجارية</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} style={inputStyle} placeholder="مثال: Samsung" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>وصف المنتج</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="وصف تفصيلي للمنتج..." />
          </div>
        </div>
      </div>

      {/* ── التسعير ── */}
      <div style={card}>
        <h3 style={h3}>💰 التسعير</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={checkboxRow}>
            <input type="checkbox" checked={isPriceOnRequest} onChange={(e) => setIsPriceOnRequest(e.target.checked)} style={{ accentColor: 'var(--blue-primary)', width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>السعر عند الطلب</span>
          </label>
          {!isPriceOnRequest && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={labelStyle}>السعر (ر.س)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} placeholder="0" min="0" step="0.01" />
              </div>
              <div>
                <label style={labelStyle}>السعر القديم (اختياري)</label>
                <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} style={inputStyle} placeholder="0" min="0" step="0.01" />
              </div>
            </div>
          )}
          <label style={checkboxRow}>
            <input type="checkbox" checked={requiresInstallation} onChange={(e) => setRequiresInstallation(e.target.checked)} style={{ accentColor: 'var(--blue-primary)', width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>يحتاج تركيب</span>
          </label>
          {requiresInstallation && (
            <div>
              <label style={labelStyle}>سعر التركيب (ر.س)</label>
              <input type="number" value={installationPrice} onChange={(e) => setInstallationPrice(e.target.value)} style={inputStyle} placeholder="0" min="0" step="0.01" />
            </div>
          )}
        </div>
      </div>

      {/* ── الصورة ── */}
      <div style={card}>
        <h3 style={h3}>🖼 صورة المنتج</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
          {imagePreview && (
            <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageUpload} style={{ display: 'none' }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)', color: 'var(--text-second)', fontSize: '0.875rem', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
            {uploading ? 'جاري الرفع...' : imagePreview ? '📷 تغيير الصورة' : '📷 رفع صورة'}
          </button>
        </div>
      </div>

      {/* ── المواصفات ── */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ ...h3, margin: 0 }}>⚙ المواصفات</h3>
          <button type="button" onClick={addSpec}
            style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', backgroundColor: 'rgba(21,118,212,0.1)', border: '1px solid rgba(21,118,212,0.25)', color: 'var(--blue-light)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            + إضافة
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {specs.map((spec, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <input value={spec.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} placeholder="المواصفة (مثال: سعة التبريد)" style={inputStyle} />
              <input value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} placeholder="القيمة (مثال: 18000 BTU)" style={inputStyle} />
              <button type="button" onClick={() => removeSpec(i)} style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
            </div>
          ))}
          {specs.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: '0.875rem', margin: 0 }}>لا توجد مواصفات — اضغط "+ إضافة"</p>}
        </div>
      </div>

      {/* ── الخيارات ── */}
      <div style={card}>
        <h3 style={h3}>🔧 خيارات العرض</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={checkboxRow}>
            <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} style={{ accentColor: 'var(--success)', width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>متاح للبيع</span>
          </label>
          <label style={checkboxRow}>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} style={{ accentColor: 'var(--warning)', width: '18px', height: '18px' }} />
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>⭐ منتج مميز (يظهر في الصفحة الرئيسية)</span>
          </label>
        </div>
      </div>

      {/* ── أزرار ── */}
      <div style={{ display: 'flex', gap: '0.875rem' }}>
        <button type="submit" disabled={loading}
          style={{ flex: 1, padding: '0.9375rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'جاري الحفظ...' : isEdit ? '💾 حفظ التعديلات' : '✓ إنشاء المنتج'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')}
          style={{ padding: '0.9375rem 1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)', color: 'var(--text-second)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          إلغاء
        </button>
      </div>
    </form>
  )
}
