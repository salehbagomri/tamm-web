'use client'

import { useState } from 'react'
import type { AdminOrderDetail, AvailableTechnician } from '@/lib/data/admin/orders'
import type { OrderStatus } from '@/lib/types/order'
import {
  updateOrderStatus,
  assignTechnician,
  scheduleOrder,
} from '@/lib/actions/admin/orders'

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

export default function AdminOrderActions({ order, technicians }: AdminOrderActionsProps) {
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
    const res = await assignTechnician(order.id, selectedTech)
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
                {technicians.map((t) => (
                  <option key={t.technicianId} value={t.technicianId}>
                    {t.name}{t.phone ? ` — ${t.phone}` : ''}
                  </option>
                ))}
              </select>
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
