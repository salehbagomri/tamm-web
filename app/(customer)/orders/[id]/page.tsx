import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/data/orders'
import { getPaymentMethods } from '@/lib/data/payment'
import OrderStatusTracker from '@/components/customer/orders/OrderStatusTracker'
import OrderDetailCard from '@/components/customer/orders/OrderDetailCard'
import OrderItemsList from '@/components/customer/orders/OrderItemsList'
import TechnicianCard from '@/components/customer/orders/TechnicianCard'
import QuoteSection from '@/components/customer/orders/QuoteSection'
import OrderDetailRealtimeWrapper from '@/components/customer/orders/OrderDetailRealtimeWrapper'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `طلب #${id.substring(0, 8)} | تمّ` } // Not the actual order_number but sufficient for SEO/Title
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const [order, paymentMethods] = await Promise.all([
    getOrderById(id, user.id),
    getPaymentMethods(),
  ])
  if (!order) notFound()

  const paymentMethod = order.paymentMethodId
    ? (paymentMethods.find((m) => m.id === order.paymentMethodId) ?? null)
    : null

  return (
    <OrderDetailRealtimeWrapper orderId={id}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
          <Link href="/orders" style={{ color: 'var(--text-second)', fontSize: '0.875rem', textDecoration: 'none' }}>
            طلباتي
          </Link>
          <span style={{ color: 'var(--text-faint)' }}>←</span>
          <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>
            {order.orderNumber}
          </span>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {order.orderType !== 'quote_request' && (
            <OrderStatusTracker status={order.status} />
          )}

          <OrderDetailCard order={order} paymentMethod={paymentMethod} />

          {order.orderType === 'quote_request' && (
            <QuoteSection order={order} />
          )}

          <TechnicianCard order={order} />

          <OrderItemsList order={order} />
        </div>
      </div>
    </OrderDetailRealtimeWrapper>
  )
}
