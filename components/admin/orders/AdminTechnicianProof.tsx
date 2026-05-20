'use client'

import { useState } from 'react'
import type { AdminOrderDetail } from '@/lib/data/admin/orders'

interface AdminTechnicianProofProps {
  order: AdminOrderDetail
}

export default function AdminTechnicianProof({ order }: AdminTechnicianProofProps) {
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  // تجميع كافة الصور التوثيقية المتاحة
  const photos: string[] = []
  if (order.photoUrl) photos.push(order.photoUrl)
  if (order.photoUrls && Array.isArray(order.photoUrls)) {
    order.photoUrls.forEach((url) => {
      if (url && !photos.includes(url)) {
        photos.push(url)
      }
    })
  }

  const hasDocumentation = photos.length > 0 || order.technicianNotes

  // احتساب مدة العمل الفني
  let durationText = ''
  if (order.startedAt && order.completedAt) {
    const start = new Date(order.startedAt)
    const end = new Date(order.completedAt)
    const diffMs = end.getTime() - start.getTime()
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      if (diffMins < 60) {
        durationText = `${diffMins} دقيقة`
      } else {
        const hours = Math.floor(diffMins / 60)
        const mins = diffMins % 60
        durationText = `${hours} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ''}`
      }
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '1.25rem',
  }

  if (!hasDocumentation) {
    // إذا كان الطلب منتهياً بدون توثيق أو قيد التنفيذ وبانتظار التوثيق
    const isActive = ['assigned', 'on_the_way', 'in_progress'].includes(order.status)
    if (!isActive && order.status !== 'completed') return null

    return (
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 0.875rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👷 توثيق الصيانة الميدانية
        </h3>
        <div style={{
          backgroundColor: 'var(--bg-surface2)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px dashed var(--border)',
          textAlign: 'center',
          color: 'var(--text-second)',
          fontSize: '0.9rem',
        }}>
          {order.status === 'completed' ? (
            <p style={{ margin: 0 }}>⚠️ لم يقم الفني برفع صور توثيقية أو ملاحظات لهذه المهمة.</p>
          ) : (
            <p style={{ margin: 0 }}>⏳ بانتظار قيام الفني برفع صور العمل وكتابة التقرير الميداني عند إنجاز المهمة عبر التطبيق.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        👷 توثيق الصيانة الميدانية
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* التوقيت وفترة التنفيذ */}
        {(order.startedAt || order.completedAt) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-surface2)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}>
            {order.startedAt && (
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>تاريخ بدء الصيانة</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {new Date(order.startedAt).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            )}
            {order.completedAt && (
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>تاريخ انتهاء العمل والرفع</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {new Date(order.completedAt).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            )}
            {durationText && (
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>فترة التنفيذ الفنية</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                  ⏱️ {durationText}
                </p>
              </div>
            )}
          </div>
        )}

        {/* الملاحظات الفنية للمهمة */}
        {order.technicianNotes && (
          <div style={{
            backgroundColor: 'rgba(21, 118, 212, 0.05)',
            borderRight: '4px solid var(--blue-primary)',
            borderRadius: '0 12px 12px 0',
            padding: '1.25rem',
          }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--blue-light)', fontWeight: 700 }}>
              📋 ملاحظات وتقرير الفني:
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {order.technicianNotes}
            </p>
          </div>
        )}

        {/* ألبوم الصور */}
        {photos.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-second)', fontWeight: 600 }}>
              📸 ألبوم صور الصيانة الميدانية ({photos.length})
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '0.75rem',
            }}>
              {photos.map((url, i) => (
                <div
                  key={url}
                  onClick={() => setActivePhoto(url)}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    cursor: 'zoom-in',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  className="photo-thumbnail"
                >
                  <img
                    src={url}
                    alt={`توثيق الصيانة ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '0.375rem',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    color: '#fff',
                  }}>
                    صورة #{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / نافذة عرض الصور الكبيرة المبسطة */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 9, 15, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '85%' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={activePhoto}
              alt="صورة التوثيق مكبرة"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                border: '2px solid var(--border)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            />
            <button
              onClick={() => setActivePhoto(null)}
              style={{
                position: 'absolute',
                top: '-2.5rem',
                left: 0,
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                fontFamily: 'inherit',
              }}
            >
              إغلاق ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        .photo-thumbnail:hover {
          transform: scale(1.03);
          border-color: var(--blue-primary) !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
