import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/data/orders'
import OrderStatusTracker from '@/components/customer/orders/OrderStatusTracker'
import OrderDetailCard from '@/components/customer/orders/OrderDetailCard'
import OrderItemsList from '@/components/customer/orders/OrderItemsList'
import TechnicianCard from '@/components/customer/orders/TechnicianCard'
import QuoteSection from '@/components/customer/orders/QuoteSection'
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

  const order = await getOrderById(id, user.id)
  if (!order) notFound()

  return (
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
        
        <OrderDetailCard order={order} />
        
        {order.orderType === 'quote_request' && (
          <QuoteSection order={order} />
        )}
        
        <TechnicianCard order={order} />
        
        <OrderItemsList order={order} />
      </div>
    </div>
  )
}
