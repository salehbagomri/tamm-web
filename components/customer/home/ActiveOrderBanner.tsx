import Link from 'next/link'
import type { Order } from '@/lib/types/order'
import Badge from '@/components/ui/Badge'

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة', confirmed: 'مؤكّد', assigned: 'تم تعيين فني',
  on_the_way: 'الفني في الطريق', in_progress: 'جاري التنفيذ',
}

export default function ActiveOrderBanner({ order }: { order: Order }) {
  return (
    <div style={{
      backgroundColor: 'var(--blue-mid)',
      borderBottom: '1px solid var(--blue-primary)',
      padding: '0.75rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            لديك طلب نشط
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--blue-sky)' }}>
            #{order.orderNumber}
          </span>
          <Badge status={order.status} />
        </div>
        <Link href={`/orders/${order.id}`} style={{
          padding: '0.375rem 1rem', borderRadius: '8px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', fontSize: '0.8125rem', fontWeight: 600,
          textDecoration: 'none', whiteSpace: 'nowrap',
          transition: 'background-color 0.2s',
        }}>
          تتبع الطلب ←
        </Link>
      </div>
    </div>
  )
}
