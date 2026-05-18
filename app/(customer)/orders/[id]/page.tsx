import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/data/orders'
import { getPaymentMethods } from '@/lib/data/payment'
import OrderDetailHeader from '@/components/customer/orders/OrderDetailHeader'
import OrderTimeline from '@/components/customer/orders/OrderTimeline'
import OrderDetailCard from '@/components/customer/orders/OrderDetailCard'
import OrderItemsList from '@/components/customer/orders/OrderItemsList'
import TechnicianCard from '@/components/customer/orders/TechnicianCard'
import QuoteSection from '@/components/customer/orders/QuoteSection'
import OrderActionBar from '@/components/customer/orders/OrderActionBar'
import OrderDetailRealtimeWrapper from '@/components/customer/orders/OrderDetailRealtimeWrapper'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `طلب #${id.substring(0, 8)} | تمّ` }
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
          <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>{order.orderNumber}</span>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 1. Order number + status badge */}
          <OrderDetailHeader order={order} />

          {/* 2. Timeline (not for quote_request) */}
          {order.orderType !== 'quote_request' && (
            <OrderTimeline status={order.status} />
          )}

          {/* 3. Quote section (only for quote_request) */}
          {order.orderType === 'quote_request' && (
            <QuoteSection order={order} />
          )}

          {/* 4. Order items */}
          <OrderItemsList order={order} />

          {/* 5–8. Delivery + payment + receipt + notes */}
          <OrderDetailCard order={order} paymentMethod={paymentMethod} />

          {/* 7. Technician info */}
          <TechnicianCard order={order} />

        </div>
      </div>

      {/* Fixed bottom action bar */}
      <OrderActionBar status={order.status} />
    </OrderDetailRealtimeWrapper>
  )
}
