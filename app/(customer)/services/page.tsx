import { getGroupedServices } from '@/lib/data/services'
import ServiceCategoryTabs from '@/components/customer/services/ServiceCategoryTabs'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الخدمات | تمّ',
  description: 'خدمات التكييف والطاقة الشمسية — تركيب، صيانة، إصلاح بأسعار شفافة وفنيين معتمدين',
}

export default async function ServicesPage() {
  const grouped = await getGroupedServices()

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            خدماتنا
          </h1>
          <p style={{ color: 'var(--text-second)', margin: 0 }}>
            فنيون معتمدون — أسعار شفافة — ضمان على الخدمة
          </p>
        </div>
        <Link href="/quote-request" style={{
          padding: '0.625rem 1.5rem', borderRadius: '10px',
          backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          💬 طلب عرض سعر خاص
        </Link>
      </div>

      <ServiceCategoryTabs grouped={grouped} />
    </div>
  )
}
