import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminOrderById, getAvailableTechnicians } from '@/lib/data/admin/orders'
import { getPaymentMethods } from '@/lib/data/payment'
import AdminOrderHeader from '@/components/admin/orders/AdminOrderHeader'
import AdminCustomerInfo from '@/components/admin/orders/AdminCustomerInfo'
import AdminOrderActions from '@/components/admin/orders/AdminOrderActions'
import QuoteManagement from '@/components/admin/orders/QuoteManagement'
import AdminOrderDetailRealtimeWrapper from '@/components/admin/orders/AdminOrderDetailRealtimeWrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return { title: `تفاصيل الطلب — تمّ` }
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const [order, technicians, paymentMethods] = await Promise.all([
    getAdminOrderById(id),
    getAvailableTechnicians(),
    getPaymentMethods(),
  ])

  if (!order) notFound()

  const paymentMethod = order.paymentMethodId
    ? (paymentMethods.find((m) => m.id === order.paymentMethodId) ?? null)
    : null

  return (
    <AdminOrderDetailRealtimeWrapper orderId={id}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* الرأس */}
        <div style={{ marginBottom: '1.5rem' }}>
          <AdminOrderHeader order={order} />
        </div>

        {/* المحتوى الرئيسي */}
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: '1fr 380px',
        }}
          className="admin-order-grid"
        >
          {/* العمود الرئيسي */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AdminCustomerInfo order={order} paymentMethod={paymentMethod} />
          </div>

          {/* العمود الجانبي */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {order.orderType === 'quote_request' && (
              <QuoteManagement order={order} />
            )}
            <AdminOrderActions order={order} technicians={technicians} />
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .admin-order-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </AdminOrderDetailRealtimeWrapper>
  )
}
