import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/data/orders'
import OrderDetailHeader from '@/components/customer/orders/OrderDetailHeader'
import OrderTimeline from '@/components/customer/orders/OrderTimeline'
import OrderDetailCard from '@/components/customer/orders/OrderDetailCard'
import OrderItemsList from '@/components/customer/orders/OrderItemsList'
import TechnicianCard from '@/components/customer/orders/TechnicianCard'
import QuoteSection from '@/components/customer/orders/QuoteSection'
import OrderActionBar from '@/components/customer/orders/OrderActionBar'
import OrderDetailRealtimeWrapper from '@/components/customer/orders/OrderDetailRealtimeWrapper'
import ReviewCard from '@/components/customer/orders/ReviewCard'
import { getReviewByOrderId } from '@/lib/data/reviews'
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

  const [order, review] = await Promise.all([
    getOrderById(id, user.id),
    getReviewByOrderId(supabase, id),
  ])
  if (!order) notFound()

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

          {/* 📄 كرت الفاتورة الرسمية للطلبات المكتملة */}
          {order.status === 'completed' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              background: 'linear-gradient(135deg, rgba(21, 118, 212, 0.05), rgba(8, 14, 24, 0.2))',
              borderRight: '4px solid var(--blue-primary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <span style={{ fontSize: '2rem' }}>📄</span>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    فاتورة المبيعات الرسمية
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-second)', lineHeight: 1.4 }}>
                    تم إصدار فاتورة طلبك وتوثيق العملية بنجاح. يمكنك الآن معاينتها وطباعتها أو حفظها بصيغة PDF.
                  </p>
                </div>
              </div>
              <Link
                href={`/orders/${id}/invoice`}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: 'var(--blue-primary)',
                  color: '#fff',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  transition: 'background 0.2s',
                  boxShadow: '0 4px 12px rgba(21, 118, 212, 0.2)',
                }}
              >
                عرض وتحميل الفاتورة
              </Link>
            </div>
          )}

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
          <OrderDetailCard order={order} />

          {/* 7. Technician info */}
          <TechnicianCard order={order} />

          {/* 8. Review */}
          <ReviewCard
            orderId={id}
            technicianId={order.technicianId ?? null}
            existingReview={review}
            orderStatus={order.status}
          />

        </div>
      </div>

      {/* Fixed bottom action bar */}
      <OrderActionBar status={order.status} />
    </OrderDetailRealtimeWrapper>
  )
}
