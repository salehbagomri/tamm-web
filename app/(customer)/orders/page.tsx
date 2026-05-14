import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCustomerOrders } from '@/lib/data/orders'
import OrdersTabs from '@/components/customer/orders/OrdersTabs'
import OrdersRealtimeWrapper from '@/components/customer/orders/OrdersRealtimeWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'طلباتي | تمّ',
  description: 'متابعة وتتبع طلباتك في منصة تمّ',
}

export default async function OrdersPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const orders = await getCustomerOrders(user.id)

  return (
    <OrdersRealtimeWrapper userId={user.id}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
            طلباتي
          </h1>
          <p style={{ color: 'var(--text-second)', margin: 0 }}>
            تابع حالة طلباتك، المواعيد المجدولة، وعروض الأسعار
          </p>
        </div>

        <OrdersTabs initialOrders={orders} />
      </div>
    </OrdersRealtimeWrapper>
  )
}
