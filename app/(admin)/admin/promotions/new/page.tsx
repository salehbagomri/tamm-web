import PromotionForm from '@/components/admin/promotions/PromotionForm'

export const metadata = { title: 'إضافة عرض جديد — تمّ' }

export default function NewPromotionPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 2rem', color: 'var(--text-primary)' }}>
        ➕ إضافة عرض جديد للسلايدر
      </h1>
      <PromotionForm />
    </div>
  )
}
