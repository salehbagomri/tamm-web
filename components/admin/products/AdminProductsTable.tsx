'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product, ProductCategory } from '@/lib/types/product'
import { deleteProduct, toggleProductAvailability } from '@/lib/actions/admin/products'

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ac: 'تكييف', solar_panel: 'لوح شمسي',
  solar_battery: 'بطارية', solar_inverter: 'إنفيرتر', accessory: 'إكسسوار',
}

function Toggle({ id, checked, onToggle }: { id: string; checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button onClick={() => onToggle(!checked)} style={{
      width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', padding: '2px',
      backgroundColor: checked ? 'var(--success)' : 'var(--bg-surface2)',
      transition: 'background-color 0.2s', display: 'flex', alignItems: 'center',
      justifyContent: checked ? 'flex-end' : 'flex-start',
    }}>
      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

function DeleteDialog({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</p>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem', fontWeight: 700 }}>تأكيد الحذف</h3>
        <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
          هل أنت متأكد من حذف <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>؟ لا يمكن التراجع.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface2)', color: 'var(--text-second)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            إلغاء
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: 'var(--error)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'جاري الحذف...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProductsTable({ products, totalCount }: { products: Product[]; totalCount: number }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleteLoading(true); setDeleteError('')
    const res = await deleteProduct(id)
    setDeleteLoading(false)
    if (res.error) { setDeleteError(res.error) }
    else setDeletingId(null)
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    await toggleProductAvailability(id, !current)
    setTogglingId(null)
  }

  if (products.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
      لا توجد منتجات تطابق الفلتر
    </div>
  )

  return (
    <>
      {deletingId && (
        <DeleteDialog
          name={products.find(p => p.id === deletingId)?.name ?? ''}
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => { setDeletingId(null); setDeleteError('') }}
          loading={deleteLoading}
        />
      )}
      {deleteError && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)', fontSize: '0.875rem' }}>
          ⚠️ {deleteError}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>المنتجات</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>إجمالي: {totalCount}</span>
        </div>

        {/* Desktop Table */}
        <div className="prod-desk">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface2)' }}>
                {['', 'المنتج', 'الفئة', 'السعر', 'متاح', 'مميز', ''].map((h, i) => (
                  <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  {/* الصورة */}
                  <td style={{ padding: '0.75rem 1rem', width: '56px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--bg-surface2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <span style={{ fontSize: '1.5rem' }}>📦</span>}
                    </div>
                  </td>
                  {/* الاسم والعلامة */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <p style={{ margin: '0 0 0.125rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</p>
                    {p.brand && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-faint)' }}>{p.brand}</p>}
                  </td>
                  {/* الفئة */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)' }}>
                      {CATEGORY_LABELS[p.category]}
                    </span>
                  </td>
                  {/* السعر */}
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {p.isPriceOnRequest ? <span style={{ color: 'var(--warning)' }}>عند الطلب</span>
                      : `${(p.price ?? 0).toLocaleString('ar-SA')} ر.س`}
                  </td>
                  {/* Toggle المتاح */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Toggle id={p.id} checked={togglingId === p.id ? !p.isAvailable : p.isAvailable}
                      onToggle={() => handleToggle(p.id, p.isAvailable)} />
                  </td>
                  {/* مميز */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {p.isFeatured && <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(245,166,35,0.1)', color: 'var(--warning)' }}>⭐ مميز</span>}
                  </td>
                  {/* الأزرار */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/products/${p.id}/edit`} style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        تعديل
                      </Link>
                      <button onClick={() => { setDeleteError(''); setDeletingId(p.id) }}
                        style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="prod-mob" style={{ display: 'none', flexDirection: 'column' }}>
          {products.map((p, i) => (
            <div key={p.id} style={{ padding: '1rem 1.25rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--bg-surface2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>📦</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{p.name}</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)' }}>{CATEGORY_LABELS[p.category]}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{p.isPriceOnRequest ? 'عند الطلب' : `${(p.price ?? 0).toLocaleString('ar-SA')} ر.س`}</span>
                  <Toggle id={p.id} checked={p.isAvailable} onToggle={() => handleToggle(p.id, p.isAvailable)} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/admin/products/${p.id}/edit`} style={{ padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(21,118,212,0.1)', color: 'var(--blue-light)', textDecoration: 'none' }}>تعديل</Link>
                  <button onClick={() => setDeletingId(p.id)} style={{ padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', color: 'var(--error)', cursor: 'pointer', fontFamily: 'inherit' }}>حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) { .prod-desk{display:none!important} .prod-mob{display:flex!important} }
      `}</style>
    </>
  )
}
