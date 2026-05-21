'use client'

import { useState } from 'react'
import type { AdminOrderDetail, AvailableTechnician } from '@/lib/data/admin/orders'
import type { OrderStatus } from '@/lib/types/order'
import {
  updateOrderStatus,
  assignTechnician,
  scheduleOrder,
} from '@/lib/actions/admin/orders'
import type { InvoiceData } from '@/lib/actions/admin/invoices'
import { createInvoiceForOrder } from '@/lib/actions/admin/invoices'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',     label: 'معلق' },
  { value: 'confirmed',   label: 'مؤكد' },
  { value: 'assigned',    label: 'مُعيَّن' },
  { value: 'on_the_way',  label: 'في الطريق' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed',   label: 'مكتمل' },
  { value: 'cancelled',   label: 'ملغي' },
]

const PERIOD_OPTIONS = [
  { value: 'morning',   label: 'صباحاً (8 - 12)' },
  { value: 'afternoon', label: 'ظهراً (12 - 4)' },
  { value: 'evening',   label: 'مساءً (4 - 8)' },
]

interface AdminOrderActionsProps {
  order: AdminOrderDetail
  technicians: AvailableTechnician[]
  invoice: InvoiceData | null
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  backgroundColor: 'var(--bg-surface2)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
}

const btnPrimary: React.CSSProperties = {
  width: '100%', padding: '0.875rem',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
  color: '#fff', fontWeight: 700,
  fontSize: '1rem', border: 'none',
  cursor: 'pointer', fontFamily: 'inherit',
}

export default function AdminOrderActions({ order, technicians, invoice }: AdminOrderActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // حقول تغيير الحالة اليدوي
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status)

  // حقول تعيين الفني
  const [selectedTech, setSelectedTech] = useState(order.technicianId ?? '')
  const [schedDate, setSchedDate]         = useState(order.preferredDate ?? '')
  const [schedPeriod, setSchedPeriod]     = useState(order.scheduledPeriod ?? '')
  const [schedHour, setSchedHour]         = useState(order.scheduledHour ?? '')
  const [notesForTech, setNotesForTech]   = useState(order.managerNotes ?? '')

  function showSuccess(msg: string) {
    setSuccess(msg); setError('')
    setTimeout(() => setSuccess(''), 4000)
  }

  async function handleStatusChange() {
    if (selectedStatus === order.status) return
    setLoading(true)
    const res = await updateOrderStatus(order.id, selectedStatus)
    setLoading(false)
    if (res.error) setError(res.error)
    else showSuccess('تم تحديث الحالة بنجاح ✓')
  }

  async function handleAssign() {
    if (!selectedTech) { setError('يرجى اختيار الفني'); return }
    setLoading(true)
    const res = await assignTechnician(order.id, selectedTech, notesForTech)
    if (!res.error && (schedPeriod || schedHour)) {
      await scheduleOrder(order.id, schedPeriod, schedHour)
    }
    setLoading(false)
    if (res.error) setError(res.error)
    else showSuccess('تم تعيين الفني وجدولة الطلب ✓')
  }

  async function handleScheduleUpdate() {
    if (!schedPeriod) { setError('يرجى اختيار الفترة الزمنية'); return }
    setLoading(true)
    const res = await scheduleOrder(order.id, schedPeriod, schedHour)
    setLoading(false)
    if (res.error) setError(res.error)
    else showSuccess('تم تحديث الموعد ✓')
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '1.5rem',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: 'var(--text-second)',
    fontWeight: 500,
    marginBottom: '0.375rem',
    display: 'block',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── رسائل النتيجة ── */}
      {success && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(34,201,138,0.1)', border: '1px solid rgba(34,201,138,0.3)', color: 'var(--success)', fontSize: '0.875rem', textAlign: 'center' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* ── كرت الفاتورة وإرسال واتساب (للطلب المكتمل) ── */}
      {order.status === 'completed' && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📄</span>
            <span>فاتورة الطلب والواتساب</span>
          </h3>

          {!invoice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-second)', lineHeight: 1.4 }}>
                الطلب مكتمل ولكن لم يتم إنشاء الفاتورة بعد (طلب قديم أو تم ترحيله). يمكنك توليد الفاتورة يدوياً الآن.
              </p>
              <button
                onClick={async () => {
                  setLoading(true)
                  const res = await createInvoiceForOrder(order.id)
                  setLoading(false)
                  if (res.error) {
                    setError(res.error)
                  } else {
                    showSuccess('تم توليد الفاتورة بنجاح ✓')
                    router.refresh()
                  }
                }}
                disabled={loading}
                style={{ ...btnPrimary, background: 'linear-gradient(135deg, var(--success), #16a34a)', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'جاري التوليد...' : '⚙️ توليد الفاتورة الآن'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem', borderRight: '3px solid var(--blue-primary)' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>الرقم التسلسلي للفاتورة</p>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>{invoice.invoiceNumber}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* زر عرض الفاتورة */}
                <a
                  href={`/orders/${order.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  className="invoice-view-btn"
                >
                  <span>👁️</span>
                  <span>معاينة وطباعة الفاتورة</span>
                </a>

                {/* زر إرسال واتساب */}
                <button
                  onClick={() => {
                    let whatsappPhone = order.contactPhone || order.customerProfile?.phone || ''
                    whatsappPhone = whatsappPhone.replace(/\D/g, '')
                    if (whatsappPhone.startsWith('05') && whatsappPhone.length === 10) {
                      whatsappPhone = '966' + whatsappPhone.substring(1)
                    } else if (whatsappPhone.startsWith('5') && whatsappPhone.length === 9) {
                      whatsappPhone = '966' + whatsappPhone
                    }

                    const message = `مرحباً ${order.customerProfile?.fullName || 'عميلنا العزيز'}،\n\nيسعدنا في منصة تمّ إبلاغك باكتمال طلبك رقم #${order.orderNumber} بنجاح. 🎉\n\nيمكنك استعراض وتحميل فاتورة المبيعات الرسمية رقم (${invoice.invoiceNumber}) عبر الرابط التالي:\nhttps://tamm-web.vercel.app/orders/${order.id}/invoice\n\nنشكرك لتعاملكم معنا وثقتك في خدماتنا.\nمنصة تمّ لخدمات التكييف والطاقة الشمسية 🛠️☀️`
                    
                    const waUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(message)}`
                    window.open(waUrl, '_blank')
                  }}
                  style={{
                    ...btnPrimary,
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.26-4.542l.375.223c1.554.922 3.505 1.41 5.372 1.411 5.485 0 9.948-4.463 9.952-9.953.002-2.66-1.018-5.162-2.87-7.015C17.29 2.271 14.793 1.01 12.012 1.01c-5.489 0-9.954 4.467-9.958 9.959-.001 1.942.508 3.84 1.472 5.518l.243.421L2.73 21.264l4.587-1.806zM15.82 12.983c-.347-.174-2.057-1.014-2.375-1.13-.318-.116-.549-.174-.78.174-.231.348-.894 1.13-1.096 1.36-.202.232-.404.261-.751.087-.348-.174-1.468-.541-2.796-1.728-1.033-.922-1.73-2.06-1.932-2.408-.203-.347-.022-.536.151-.708.156-.155.348-.406.52-.609.174-.203.232-.348.348-.58.116-.231.058-.434-.03-.609-.087-.174-.78-1.884-1.068-2.58-.28-.677-.566-.584-.78-.595-.201-.01-.433-.01-.664-.01-.231 0-.607.087-.924.434-.318.348-1.214 1.189-1.214 2.9 0 1.71 1.243 3.361 1.417 3.593.173.232 2.446 3.734 5.925 5.234.827.357 1.472.57 1.975.73.832.264 1.59.227 2.188.138.667-.1 2.057-.84 2.346-1.652.29-.812.29-1.507.203-1.652-.087-.145-.318-.232-.665-.406z"/>
                  </svg>
                  <span>إرسال الفاتورة بالواتساب</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── تعيين الفني (pending / confirmed) ── */}
      {(order.status === 'pending' || order.status === 'confirmed') && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            👷 تعيين الفني
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>اختر الفني</label>
              <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)} style={selectStyle}>
                <option value="">— اختر فنياً —</option>
                {technicians.map((t) => {
                  const workloadLabel = t.activeTasksCount !== undefined 
                    ? ` (${t.activeTasksCount} مهام نشطة)` 
                    : ''
                  return (
                    <option key={t.technicianId} value={t.technicianId}>
                      {t.name}{workloadLabel}{t.phone ? ` — ${t.phone}` : ''}
                    </option>
                  )
                })}
              </select>

              {selectedTech && (() => {
                const tech = technicians.find(t => t.technicianId === selectedTech)
                const count = tech?.activeTasksCount ?? 0
                if (count >= 3) {
                  return (
                    <div style={{
                      backgroundColor: 'rgba(245, 166, 35, 0.08)',
                      border: '1px solid rgba(245, 166, 35, 0.3)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      fontSize: '0.8rem',
                      color: 'var(--warning)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <span>⚠️</span>
                      <span style={{ lineHeight: 1.4 }}>
                        <strong>تحذير عبء العمل:</strong> {tech?.name} لديه {count} مهام نشطة حالياً. قد يؤدي الإسناد الجديد لتأخر المواعيد.
                      </span>
                    </div>
                  )
                }
                return null
              })()}
            </div>
            <div>
              <label style={labelStyle}>تعليمات وتوجيهات للفني (اختياري)</label>
              <textarea
                value={notesForTech}
                onChange={(e) => setNotesForTech(e.target.value)}
                placeholder="مثال: يرجى الاتصال بالعميل قبل الوصول بنصف ساعة، الباب الخلفي للموقع..."
                style={{
                  ...selectStyle,
                  minHeight: '80px',
                  resize: 'vertical',
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>الفترة</label>
                <select value={schedPeriod} onChange={(e) => setSchedPeriod(e.target.value)} style={selectStyle}>
                  <option value="">— اختر الفترة —</option>
                  {PERIOD_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>الساعة التقديرية</label>
                <input type="time" value={schedHour} onChange={(e) => setSchedHour(e.target.value)} style={selectStyle} />
              </div>
            </div>
            <button onClick={handleAssign} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'جاري التعيين...' : '✓ تعيين الفني'}
            </button>
          </div>
        </div>
      )}

      {/* ── بيانات التعيين الحالي (assigned وما بعدها) ── */}
      {order.status !== 'pending' && order.status !== 'confirmed' && order.technicianName && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            👷 الفني المعيَّن
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>الاسم</p>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>{order.technicianName}</p>
            </div>
            {order.technicianPhone && (
              <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>الجوال</p>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>{order.technicianPhone}</p>
              </div>
            )}
            {order.scheduledPeriod && (
              <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>الفترة</p>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {PERIOD_OPTIONS.find(p => p.value === order.scheduledPeriod)?.label ?? order.scheduledPeriod}
                </p>
              </div>
            )}
            {order.scheduledHour && (
              <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>الساعة</p>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>{order.scheduledHour}</p>
              </div>
            )}
            {order.managerNotes && (
              <div style={{ backgroundColor: 'var(--bg-surface2)', borderRadius: '10px', padding: '0.875rem', gridColumn: 'span 2', borderRight: '3px solid var(--blue-primary)' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>تعليمات وتوجيهات المدير المرسلة للفني:</p>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.4 }}>{order.managerNotes}</p>
              </div>
            )}
          </div>
          {/* تحديث الموعد */}
          <details style={{ marginTop: '0.5rem' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-faint)', marginBottom: '0.75rem' }}>
              تحديث الموعد
            </summary>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select value={schedPeriod} onChange={(e) => setSchedPeriod(e.target.value)} style={selectStyle}>
                <option value="">— الفترة —</option>
                {PERIOD_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <input type="time" value={schedHour} onChange={(e) => setSchedHour(e.target.value)} style={selectStyle} />
            </div>
            <button onClick={handleScheduleUpdate} disabled={loading} style={{ ...btnPrimary, marginTop: '0.75rem', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'جاري الحفظ...' : 'حفظ الموعد'}
            </button>
          </details>
        </div>
      )}

      {/* ── تغيير الحالة يدوياً ── */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          🔄 تغيير الحالة
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)} style={selectStyle}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={handleStatusChange}
            disabled={loading || selectedStatus === order.status}
            style={{
              ...btnPrimary,
              opacity: (loading || selectedStatus === order.status) ? 0.5 : 1,
              cursor: (loading || selectedStatus === order.status) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'جاري التحديث...' : 'تحديث الحالة'}
          </button>
        </div>
      </div>
    </div>
  )
}
