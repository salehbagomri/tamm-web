import { getAdminPromotionById } from '@/lib/data/admin/promotions'
import PromotionForm from '@/components/admin/promotions/PromotionForm'
import { notFound } from 'next/navigation'

export const metadata = { title: 'تعديل العرض — تمّ' }

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const promotion = await getAdminPromotionById(resolvedParams.id)

  if (!promotion) return notFound()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 2rem', color: 'var(--text-primary)' }}>
        ✏️ تعديل العرض
      </h1>
      <PromotionForm promotion={promotion} />
    </div>
  )
}
