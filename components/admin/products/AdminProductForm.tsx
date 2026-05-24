'use client'

import { useState, useRef, useEffect } from 'react'
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

interface LocalImage {
  id?: string
  imageUrl: string
  sortOrder: number
  isNew?: boolean
  file?: File
}

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
  
  // إدارة صور المنتجات المتعددة
  const [imagesList, setImagesList]               = useState<LocalImage[]>([])
  
  const [specs, setSpecs]                         = useState<{ key: string; value: string }[]>(
    Object.entries(product?.specs ?? {}).map(([key, value]) => ({ key, value: String(value) }))
  )
  // حقول المخزون والتكلفة
  const [costPrice, setCostPrice]                 = useState(product?.costPrice?.toString() ?? '')
  const [stockQuantity, setStockQuantity]         = useState(product?.stockQuantity?.toString() ?? '0')
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold?.toString() ?? '3')
  const [supplierName, setSupplierName]           = useState(product?.supplierName ?? '')
  const [supplierSku, setSupplierSku]             = useState(product?.supplierSku ?? '')
  const [autoHideWhenOut, setAutoHideWhenOut]     = useState(product?.autoHideWhenOut ?? true)

  const [loading, setLoading]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')

  // تهيئة الصور المتوفرة للمنتج
  useEffect(() => {
    if (product) {
      const initialImages: LocalImage[] = (product.images ?? []).map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder,
      }))
      
      // Fallback في حال كانت هناك صورة قديمة image_url فقط
      if (initialImages.length === 0 && product.imageUrl) {
        initialImages.push({
          imageUrl: product.imageUrl,
          sortOrder: 0,
        })
      }
      setImagesList(initialImages.sort((a, b) => a.sortOrder - b.sortOrder))
    }
  }, [product])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        setError(`حجم الصورة "${file.name}" أكبر من 5 ميجابايت`)
        continue
      }

      const fd = new FormData()
      fd.append('file', file)
      
      const res = await uploadProductImage(fd)
      if (res.error) {
        setError(res.error)
      } else if (res.url) {
        setImagesList((prev) => {
          const newImg: LocalImage = {
            imageUrl: res.url!,
            sortOrder: prev.length,
          }
          return [...prev, newImg]
        })
      }
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(index: number) {
    setImagesList((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index)
      // إعادة تعيين sortOrder تصاعدياً بناءً على الموقع الجديد
      return filtered.map((img, idx) => ({ ...img, sortOrder: idx }))
    })
  }

  function shiftImage(index: number, direction: 'left' | 'right') {
    if (index === 0 && direction === 'left') return
    if (index === imagesList.length - 1 && direction === 'right') return

    const targetIndex = direction === 'left' ? index - 1 : index + 1
    const newList = [...imagesList]
    
    // سواب (تبديل المواقع)
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp

    // تحديث sortOrder
    const finalizedList = newList.map((img, idx) => ({
      ...img,
      sortOrder: idx,
    }))

    setImagesList(finalizedList)
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
    
    // إرسال المصفوفة الجديدة والـ primaryUrl
    const primaryUrl = imagesList.length > 0 ? imagesList[0].imageUrl : null

    const data = {
      name, category, brand: brand || null, description: description || null,
      price: isPriceOnRequest ? null : (parseFloat(price) || null),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      isPriceOnRequest, requiresInstallation,
      installationPrice: requiresInstallation ? (parseFloat(installationPrice) || 0) : 0,
      isAvailable, isFeatured,
      imageUrl: primaryUrl,
      images: imagesList.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder,
      })),
      specs: specsObj,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      stockQuantity: parseInt(stockQuantity) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 3,
      supplierName: supplierName || null,
      supplierSku: supplierSku || null,
      autoHideWhenOut,
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
    <form onSubmit={handleSubmit} noValidate dir="rtl">
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

      {/* ── المخزون والتكلفة ── */}
      <div style={{ ...card, borderRight: '3px solid var(--warning)' }}>
        <h3 style={h3}>📦 المخزون والتكلفة — <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 400 }}>معلومات سرية لا تظهر للعميل</span></h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>سعر التكلفة من المورد (ر.س)</label>
            <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} style={inputStyle} placeholder="0" min="0" step="0.01" />
          </div>
          <div>
            <label style={labelStyle}>الكمية المتوفرة</label>
            <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} style={inputStyle} placeholder="0" min="0" step="1" />
          </div>
          <div>
            <label style={labelStyle}>حد التنبيه (كمية)</label>
            <input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} style={inputStyle} placeholder="3" min="0" step="1" />
          </div>
          <div>
            <label style={labelStyle}>اسم المورد</label>
            <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} style={inputStyle} placeholder="مثال: شركة النور" />
          </div>
          <div>
            <label style={labelStyle}>كود المنتج عند المورد (SKU)</label>
            <input value={supplierSku} onChange={(e) => setSupplierSku(e.target.value)} style={inputStyle} placeholder="مثال: AC-SP-1500" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={checkboxRow}>
              <input type="checkbox" checked={autoHideWhenOut} onChange={(e) => setAutoHideWhenOut(e.target.checked)} style={{ accentColor: 'var(--warning)', width: '18px', height: '18px' }} />
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>إخفاء تلقائي عند نفاد الكمية</span>
            </label>
          </div>
        </div>
        {costPrice && price && !isPriceOnRequest && (() => {
          const cost = parseFloat(costPrice)
          const sell = parseFloat(price)
          if (cost > 0 && sell > 0) {
            const profit = sell - cost
            const margin = ((profit / sell) * 100).toFixed(1)
            return (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: profit > 0 ? 'rgba(34,201,138,0.08)' : 'rgba(224,82,82,0.08)', border: `1px solid ${profit > 0 ? 'rgba(34,201,138,0.25)' : 'rgba(224,82,82,0.25)'}`, display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-second)' }}>💰 هامش الربح: <strong style={{ color: profit > 0 ? 'var(--success)' : 'var(--error)' }}>{profit.toFixed(2)} ر.س</strong></span>
                <span style={{ color: 'var(--text-second)' }}>📊 النسبة: <strong style={{ color: profit > 0 ? 'var(--success)' : 'var(--error)' }}>{margin}%</strong></span>
              </div>
            )
          }
          return null
        })()}
      </div>

      {/* ── معرض صور المنتج المتعددة (Upgraded) ── */}
      <div style={card}>
        <h3 style={h3}>🖼 معرض صور المنتج (صور متعددة)</h3>
        <p style={{ color: 'var(--text-second)', fontSize: '0.8rem', margin: '0 0 1.25rem', lineHeight: 1.4 }}>
          يمكنك رفع صور متعددة للمنتج. الصورة الأولى (أقصى اليمين) ستكون هي الصورة الرئيسية للغلاف. استخدم الأسهم لإعادة ترتيب أولويات الصور.
        </p>

        {/* شبكة الصور المرفوعة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}>
          {imagesList.map((img, idx) => (
            <div key={idx} style={{
              position: 'relative',
              aspectRatio: '1',
              border: idx === 0 ? '2px solid var(--blue-primary)' : '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-surface2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: idx === 0 ? '0 4px 12px rgba(21,118,212,0.15)' : 'none',
            }}>
              <img src={img.imageUrl} alt={`product-img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }} />
              
              {/* شارة الصورة الرئيسية */}
              {idx === 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  backgroundColor: 'var(--blue-primary)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}>
                  رئيسية
                </span>
              )}

              {/* زر الحذف */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  backgroundColor: 'rgba(224,82,82,0.85)',
                  border: 'none',
                  borderRadius: '4px',
                  width: '20px',
                  height: '20px',
                  color: '#fff',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                ✕
              </button>

              {/* أزرار الأسهم لإعادة الترتيب */}
              <div style={{
                position: 'absolute',
                bottom: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.375rem',
                backgroundColor: 'rgba(8,14,24,0.75)',
                padding: '2px 6px',
                borderRadius: '6px',
                zIndex: 2,
              }}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => shiftImage(idx, 'left')}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: idx === 0 ? 'var(--text-faint)' : '#fff',
                    fontSize: '0.7rem',
                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    padding: 0,
                  }}
                >
                  ◀
                </button>
                <span style={{ color: 'var(--text-second)', fontSize: '0.65rem' }}>{idx + 1}</span>
                <button
                  type="button"
                  disabled={idx === imagesList.length - 1}
                  onClick={() => shiftImage(idx, 'right')}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: idx === imagesList.length - 1 ? 'var(--text-faint)' : '#fff',
                    fontSize: '0.7rem',
                    cursor: idx === imagesList.length - 1 ? 'not-allowed' : 'pointer',
                    padding: 0,
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
          ))}

          {/* كرت رفع صورة جديدة فارغ */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              aspectRatio: '1',
              border: '2px dashed var(--border)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              backgroundColor: 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!uploading) e.currentTarget.style.borderColor = 'var(--blue-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <span style={{ fontSize: '1.75rem', color: 'var(--text-second)' }}>+</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-second)', marginTop: '0.25rem' }}>
              {uploading ? 'جاري الرفع...' : 'رفع صورة'}
            </span>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
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
