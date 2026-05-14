import { createServerClient } from '@/lib/supabase/server'
import type { PaymentMethod } from '@/lib/types/payment'

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return (data as any[]).map((row): PaymentMethod => ({
      id: row.id,
      type: row.type,
      name: row.name,
      accountNumber: row.account_number ?? null,
      logoUrl: row.logo_url ?? null,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }))
  } catch {
    return []
  }
}
