'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminPromotion } from '@/lib/data/admin/promotions'
import { savePromotion } from '@/lib/actions/admin/promotions'

export default function PromotionForm({ promotion }: { promotion?: AdminPromotion }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(promotion?.title || '')
  const [subtitle, setSubtitle] = useState(promotion?.subtitle || '')
  const [iconName, setIconName] = useState(promotion?.iconName || '')
  const [gradientStart, setGradientStart] = useState(promotion?.gradientStart || '#0A2540')
  const [gradientEnd, setGradientEnd] = useState(promotion?.gradientEnd || '#0E4C8C')
  const [destination, setDestination] = useState(promotion?.destination || '')
  const [sortOrder, setSortOrder] = useState(promotion?.sortOrder || 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('عنوان العرض مطلوب'); return }

    setLoading(true)
    setError('')

    const res = await savePromotion({
      id: promotion?.id,
      title: title.trim(),
      subtitle: subtitle.trim(),
      iconName: iconName.trim(),
      gradientStart,
      gradientEnd,
      destination: destination.trim(),
      sortOrder,
    })

    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push('/admin/promotions')
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text-primary)',
    fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none'
  }

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
      {error && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '10px', backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', margin: '0 0 0.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>العنوان (إلزامي)</label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', margin: '0 0 0.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>العنوان الفرعي</label>
          <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', margin: '0 0 0.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>اسم الأيقونة (مثل: star)</label>
          <input type="text" value={iconName} onChange={(e) => setIconName(e.target.value)} style={inputStyle} dir="ltr" />
        </div>
        <div>
          <label style={{ display: 'block', margin: '0 0 0.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>لون البداية (Hex)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} style={{ width: '48px', height: '44px', padding: '0', border: 'none', borderRadius: '10px', cursor: 'pointer', backgroundColor: 'transparent' }} />
            <input type="text" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} style={{ ...inputStyle, flex: 1 }} dir="ltr" />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', margin: '0 0 0.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>لون النهاية (Hex)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} style={{ width: '48px', height: '44px', padding: '0', border: 'none', borderRadius: '10px', cursor: 'pointer', backgroundColor: 'transparent' }} />
            <input type="text" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} style={{ ...inputStyle, flex: 1 }} dir="ltr" />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', margin: '0 0 0.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>الوجهة (الرابط)</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} style={inputStyle} dir="ltr" placeholder="/customer/store" />
        </div>
        <div>
          <label style={{ display: 'block', margin: '0 0 0.5rem', color: 'var(--text-second)', fontSize: '0.9rem' }}>الترتيب</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} style={inputStyle} />
        </div>
      </div>

      <div style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '16px', background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }}>
        <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{title || 'عنوان تجريبي'}</h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>{subtitle || 'عنوان فرعي تجريبي'}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.push('/admin/promotions')} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-second)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>إلغاء</button>
        <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'جاري الحفظ...' : 'حفظ العرض'}
        </button>
      </div>
    </form>
  )
}
