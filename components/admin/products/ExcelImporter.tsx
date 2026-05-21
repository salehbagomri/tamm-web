'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { bulkUpdateStock, type StockImportItem } from '@/lib/actions/admin/inventory'
import { formatPrice } from '@/lib/utils/format'

type ProductDbInfo = {
  id: string
  name: string
  supplierSku: string | null
  stockQuantity: number
  costPrice: number | null
}

type MatchedItem = {
  rowNum: number
  excelName?: string
  excelSku?: string
  excelQuantity?: number
  excelCostPrice?: number | null
  matchedProduct: ProductDbInfo | null
  matchMethod: 'sku' | 'name' | 'partial_name' | 'none'
  status: 'matched' | 'partial' | 'unmatched'
}

type ExcelImporterProps = {
  products: ProductDbInfo[]
}

// مترادفات حقول الإكسل لتسهيل التعرف الذكي على الأعمدة
const SKU_SYNONYMS = ['sku', 'supplier_sku', 'كود', 'رمز', 'كود المورد', 'رمز المورد', 'رقم المنتج']
const NAME_SYNONYMS = ['name', 'product_name', 'الاسم', 'اسم المنتج', 'المادة', 'اسم الصنف', 'الصنف']
const QTY_SYNONYMS = ['qty', 'quantity', 'stock', 'الكمية', 'المخزون', 'العدد', 'الكميه', 'المتوفر']
const COST_SYNONYMS = ['cost', 'cost_price', 'costPrice', 'التكلفة', 'سعر التكلفة', 'سعر الشراء', 'التكلفه', 'سعر التوريد']

export default function ExcelImporter({ products }: ExcelImporterProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const [sheetName, setSheetName] = useState('')
  const [matchedItems, setMatchedItems] = useState<MatchedItem[]>([])
  const [filter, setFilter] = useState<'all' | 'matched' | 'partial' | 'unmatched'>('all')
  const [notes, setNotes] = useState('تحديث المخزون عبر استيراد كشف إكسل')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // تنظيف النص لتسهيل المقارنة الذكية
  const cleanString = (str: string) => {
    return str.trim().toLowerCase().replace(/[\s_-]/g, '')
  }

  // التعرف الذكي على رقم العمود بناءً على المترادفات
  const findColumnIndex = (headers: string[], synonyms: string[]): number => {
    return headers.findIndex(h => {
      if (!h) return false
      const headerClean = cleanString(String(h))
      return synonyms.some(syn => {
        const synClean = cleanString(syn)
        return headerClean === synClean || headerClean.includes(synClean) || synClean.includes(headerClean)
      })
    })
  }

  const handleFile = (file: File) => {
    if (!file) return
    setError('')
    setSuccess('')
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        if (workbook.SheetNames.length === 0) {
          setError('الملف المرفوع فارغ أو غير صالح.')
          return
        }

        const selectedSheetName = workbook.SheetNames[0]
        setSheetName(selectedSheetName)
        const worksheet = workbook.Sheets[selectedSheetName]
        
        // قراءة البيانات كمصفوفة ثنائية الأبعاد (rows arrays)
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 })
        
        if (rows.length < 2) {
          setError('يجب أن يحتوي الملف على صف العناوين وصف واحد من البيانات على الأقل.')
          return
        }

        const headers = rows[0].map(h => String(h || '').trim())
        
        // تحديد مؤشرات الأعمدة
        const skuIdx = findColumnIndex(headers, SKU_SYNONYMS)
        const nameIdx = findColumnIndex(headers, NAME_SYNONYMS)
        const qtyIdx = findColumnIndex(headers, QTY_SYNONYMS)
        const costIdx = findColumnIndex(headers, COST_SYNONYMS)

        if (skuIdx === -1 && nameIdx === -1) {
          setError('لم نتمكن من التعرف على أعمدة "كود المنتج (SKU)" أو "اسم المنتج". يرجى التأكد من تسمية الأعمدة بشكل واضح.')
          return
        }

        if (qtyIdx === -1) {
          setError('لم نتمكن من العثور على عمود "الكمية" أو "المخزون".')
          return
        }

        const parsedItems: MatchedItem[] = []

        // معالجة صفوف البيانات
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (row.length === 0 || row.every(cell => cell === null || cell === '')) {
            continue // تخطي الصفوف الفارغة تماماً
          }

          const rawSku = skuIdx !== -1 ? String(row[skuIdx] || '').trim() : ''
          const rawName = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : ''
          
          // قراءة الكمية وسعر التكلفة مع معالجة الأرقام
          const rawQty = qtyIdx !== -1 ? parseInt(String(row[qtyIdx]).replace(/[^\d-]/g, '')) : NaN
          const rawCost = costIdx !== -1 && row[costIdx] !== undefined && row[costIdx] !== null && row[costIdx] !== '' 
            ? parseFloat(String(row[costIdx]).replace(/[^\d.]/g, '')) 
            : null

          if (isNaN(rawQty)) {
            continue // تخطي الصفوف التي لا تحتوي على كمية صالحة
          }

          // محاولة مطابقة الصنف بقاعدة البيانات
          let matchedProduct: ProductDbInfo | null = null
          let matchMethod: MatchedItem['matchMethod'] = 'none'

          // 1. المطابقة عن طريق كود المورد SKU (الأولوية القصوى)
          if (rawSku) {
            matchedProduct = products.find(p => p.supplierSku && cleanString(p.supplierSku) === cleanString(rawSku)) || null
            if (matchedProduct) {
              matchMethod = 'sku'
            }
          }

          // 2. المطابقة عن طريق الاسم الكامل (إذا لم يُطابق بالـ SKU)
          if (!matchedProduct && rawName) {
            matchedProduct = products.find(p => cleanString(p.name) === cleanString(rawName)) || null
            if (matchedProduct) {
              matchMethod = 'name'
            }
          }

          // 3. المطابقة الجزئية بالاسم (إذا لم يتطابق تماماً)
          if (!matchedProduct && rawName) {
            matchedProduct = products.find(p => {
              const cleanDbName = cleanString(p.name)
              const cleanExcelName = cleanString(rawName)
              return cleanDbName.includes(cleanExcelName) || cleanExcelName.includes(cleanDbName)
            }) || null
            
            if (matchedProduct) {
              matchMethod = 'partial_name'
            }
          }

          const status: MatchedItem['status'] = 
            matchMethod === 'none' ? 'unmatched' :
            matchMethod === 'partial_name' ? 'partial' : 'matched'

          parsedItems.push({
            rowNum: i + 1,
            excelName: rawName || undefined,
            excelSku: rawSku || undefined,
            excelQuantity: rawQty,
            excelCostPrice: isNaN(rawCost || NaN) ? null : rawCost,
            matchedProduct,
            matchMethod,
            status
          })
        }

        setMatchedItems(parsedItems)
        if (parsedItems.length === 0) {
          setError('لم نتمكن من استخراج أي بيانات صالحة من الملف.')
        }
      } catch (err) {
        console.error(err)
        setError('فشل قراءة الملف. يرجى التأكد من أنه ملف إكسل أو CSV صالح.')
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleApplyUpdates = async () => {
    const validItems = matchedItems.filter(item => item.matchedProduct !== null)
    if (validItems.length === 0) {
      setError('لا توجد أصناف مطابقة لتحديثها.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const payload: StockImportItem[] = validItems.map(item => ({
      productId: item.matchedProduct!.id,
      newQuantity: item.excelQuantity!,
      newCostPrice: item.excelCostPrice !== undefined ? item.excelCostPrice : undefined,
      notes: notes.trim() || undefined
    }))

    const res = await bulkUpdateStock(payload)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(`تم تحديث مخزون ${validItems.length} صنف بنجاح! جاري تحويلك...`)
      setTimeout(() => {
        router.push('/admin/products')
        router.refresh()
      }, 2000)
    }
  }

  // تصفية العناصر المعروضة في المعاينة
  const filteredItems = matchedItems.filter(item => {
    if (filter === 'matched') return item.status === 'matched'
    if (filter === 'partial') return item.status === 'partial'
    if (filter === 'unmatched') return item.status === 'unmatched'
    return true
  })

  // حساب إحصائيات المطابقة
  const stats = matchedItems.reduce((acc, item) => {
    acc[item.status]++
    return acc
  }, { matched: 0, partial: 0, unmatched: 0 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* منطقة رفع الملف */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'var(--blue-light)' : 'var(--border)'}`,
          backgroundColor: dragActive ? 'var(--blue-dark)' : 'var(--bg-surface)',
          borderRadius: '16px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          position: 'relative'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".xlsx, .xls, .csv" 
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        
        {fileName ? (
          <div>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 700 }}>
              {fileName}
            </h3>
            <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', margin: 0 }}>
              ورقة العمل: <span style={{ color: 'var(--blue-sky)', fontWeight: 600 }}>{sheetName}</span> • تم العثور على {matchedItems.length} صف
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 700 }}>
              اسحب وأفلت كشف المخزون هنا
            </h3>
            <p style={{ color: 'var(--text-second)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
              أو اضغط لاختيار ملف من جهازك (يدعم Excel .xlsx, .xls أو CSV)
            </p>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--bg-surface2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              اختر ملفاً
            </span>
          </div>
        )}
      </div>

      {/* تنبيهات الأخطاء أو النجاح */}
      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(224,82,82,0.1)',
          border: '1px solid rgba(224,82,82,0.2)',
          color: 'var(--error)',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(34,201,138,0.1)',
          border: '1px solid rgba(34,201,138,0.2)',
          color: 'var(--success)',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          fontWeight: 600
        }}>
          ✅ {success}
        </div>
      )}

      {/* دليل الأسماء المطابقة للأعمدة */}
      {!fileName && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.25rem'
        }}>
          <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700 }}>
            💡 نصيحة لتنسيق ملف الـ Excel:
          </h4>
          <p style={{ color: 'var(--text-second)', fontSize: '0.85rem', margin: '0 0 0.75rem', lineHeight: '1.6' }}>
            يقوم النظام بالتعرف الذكي على الأعمدة. يفضل أن يحتوي ملفك على التسميات التالية في الصف الأول:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--blue-sky)', fontWeight: 600 }}>اسم المنتج:</span> name أو اسم المنتج
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--blue-sky)', fontWeight: 600 }}>كود المورد SKU:</span> sku أو كود المورد
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--blue-sky)', fontWeight: 600 }}>الكمية الجديدة:</span> qty أو الكمية أو المخزون
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--blue-sky)', fontWeight: 600 }}>سعر التكلفة:</span> cost أو التكلفة (اختياري)
            </div>
          </div>
        </div>
      )}

      {/* المعاينة وقسم التأكيد */}
      {matchedItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* إحصائيات الفلترة */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1rem 1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setFilter('all')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: filter === 'all' ? 'var(--blue-primary)' : 'var(--bg-surface2)',
                  color: filter === 'all' ? '#fff' : 'var(--text-second)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                الكل ({matchedItems.length})
              </button>
              
              <button 
                onClick={() => setFilter('matched')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: filter === 'matched' ? 'var(--success)' : 'var(--bg-surface2)',
                  color: filter === 'matched' ? 'var(--bg-primary)' : 'var(--text-second)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                🟢 مطابقة تامة ({stats.matched})
              </button>

              <button 
                onClick={() => setFilter('partial')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: filter === 'partial' ? 'var(--warning)' : 'var(--bg-surface2)',
                  color: filter === 'partial' ? 'var(--bg-primary)' : 'var(--text-second)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                🟡 مطابقة جزئية ({stats.partial})
              </button>

              <button 
                onClick={() => setFilter('unmatched')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: filter === 'unmatched' ? 'var(--error)' : 'var(--bg-surface2)',
                  color: filter === 'unmatched' ? '#fff' : 'var(--text-second)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                🔴 غير مطابقة ({stats.unmatched})
              </button>
            </div>

            <div style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>
              المطابقات المقبولة للتحديث: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{stats.matched + stats.partial} صنف</span>
            </div>
          </div>

          {/* جدول المعاينة */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', width: '60px' }}>الصف</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)' }}>الصنف في الإكسل</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)' }}>الصنف المطابق بالمنصة</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', width: '110px' }}>الكمية بالملف</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', width: '130px' }}>المخزون الحالي</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', width: '120px' }}>التكلفة الجديدة</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', width: '120px' }}>التكلفة الحالية</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)', width: '120px' }}>حالة المطابقة</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.9rem' }}>
                        لا توجد أصناف تطابق الفلتر المحدد.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const currentStock = item.matchedProduct?.stockQuantity ?? 0
                      const currentCost = item.matchedProduct?.costPrice ?? null
                      const newStock = item.excelQuantity ?? 0
                      const diffStock = newStock - currentStock

                      return (
                        <tr key={idx} style={{ 
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: item.status === 'unmatched' ? 'rgba(220,82,82,0.02)' : 'transparent'
                        }}>
                          {/* رقم الصف */}
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                            {item.rowNum}
                          </td>
                          {/* البيانات بالإكسل */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <p style={{ margin: '0 0 0.125rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              {item.excelName || '---'}
                            </p>
                            {item.excelSku && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'monospace' }}>
                                SKU: {item.excelSku}
                              </span>
                            )}
                          </td>
                          {/* الصنف المطابق */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {item.matchedProduct ? (
                              <div>
                                <p style={{ margin: '0 0 0.125rem', fontSize: '0.875rem', color: 'var(--blue-sky)', fontWeight: 600 }}>
                                  {item.matchedProduct.name}
                                </p>
                                {item.matchedProduct.supplierSku && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'monospace' }}>
                                    SKU المنصة: {item.matchedProduct.supplierSku}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                                --- لم يتم العثور على صنف مطابق ---
                              </span>
                            )}
                          </td>
                          {/* الكمية بالملف */}
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            {item.excelQuantity}
                          </td>
                          {/* المخزون الحالي */}
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-second)' }}>{currentStock}</span>
                            {item.matchedProduct && diffStock !== 0 && (
                              <span style={{ 
                                marginRight: '0.375rem', 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                color: diffStock > 0 ? 'var(--success)' : 'var(--error)'
                              }}>
                                ({diffStock > 0 ? `+${diffStock}` : diffStock})
                              </span>
                            )}
                          </td>
                          {/* التكلفة الجديدة */}
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            {item.excelCostPrice !== null && item.excelCostPrice !== undefined ? (
                              formatPrice(item.excelCostPrice)
                            ) : (
                              <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>بلا تغيير</span>
                            )}
                          </td>
                          {/* التكلفة الحالية */}
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-second)' }}>
                            {currentCost !== null ? formatPrice(currentCost) : '---'}
                          </td>
                          {/* حالة المطابقة شارة */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {item.status === 'matched' && (
                              <span style={{ 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 700, 
                                backgroundColor: 'rgba(34,201,138,0.1)', 
                                color: 'var(--success)' 
                              }}>
                                {item.matchMethod === 'sku' ? '🟢 بكود SKU' : '🟢 بالاسم تماماً'}
                              </span>
                            )}
                            {item.status === 'partial' && (
                              <span style={{ 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 700, 
                                backgroundColor: 'rgba(245,166,35,0.1)', 
                                color: 'var(--warning)' 
                              }}>
                                🟡 اسم مشابه
                              </span>
                            )}
                            {item.status === 'unmatched' && (
                              <span style={{ 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 700, 
                                backgroundColor: 'rgba(224,82,82,0.1)', 
                                color: 'var(--error)' 
                              }}>
                                🔴 غير مطابق
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ملاحظات التحديث والحفظ */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div>
              <label style={{
                fontSize: '0.8125rem',
                color: 'var(--text-second)',
                fontWeight: 500,
                marginBottom: '0.375rem',
                display: 'block'
              }}>
                ملاحظات عملية تحديث المخزون (ستظهر في سجل حركات المنتجات):
              </label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: استيراد كشف المخزون للأسبوع الأول من يونيو"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
              <button
                onClick={handleApplyUpdates}
                disabled={loading || matchedItems.filter(i => i.matchedProduct !== null).length === 0}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: loading || matchedItems.filter(i => i.matchedProduct !== null).length === 0 ? 'not-allowed' : 'pointer',
                  opacity: loading || matchedItems.filter(i => i.matchedProduct !== null).length === 0 ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? 'جاري تطبيق التحديثات...' : `تطبيق وتحديث المخزون (${matchedItems.filter(i => i.matchedProduct !== null).length} صنف)`}
              </button>
              
              <button
                onClick={() => {
                  setMatchedItems([])
                  setFileName('')
                  setSheetName('')
                }}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-surface2)',
                  color: 'var(--text-second)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                إلغاء ورفع ملف جديد
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
