import { getCommissionRules } from '@/lib/data/admin/commissions'
import CommissionRulesManager from '@/components/admin/settings/CommissionRulesManager'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة قواعد العمولة | تمّ',
}

export default async function CommissionsSettingsPage() {
  const rules = await getCommissionRules()

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          ⚙️ إدارة قواعد العمولة
        </h1>
        <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', margin: 0 }}>
          حدد نسبة أو مبلغ العمولة لكل نوع من المهام — تُحسب تلقائياً عند إتمام كل طلب
        </p>
      </div>

      <CommissionRulesManager initialRules={rules} />
    </div>
  )
}
